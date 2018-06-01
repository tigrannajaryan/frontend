import datetime

import pytest
import pytz

from django_dynamic_fixture import G
from freezegun import freeze_time
from psycopg2.extras import DateRange

import appointment.error_constants as appointment_errors
from api.v1.stylist.serializers import (
    AppointmentSerializer,
    StylistAvailableWeekDaySerializer,
    StylistDiscountsSerializer,
    StylistProfileStatusSerializer,
    StylistSerializer,
    StylistServiceSerializer,
    StylistTodaySerializer,
)
from appointment.models import Appointment, AppointmentService
from appointment.types import AppointmentStatus
from client.models import Client
from core.choices import USER_ROLE
from core.models import User
from core.types import Weekday
from salon.models import (
    Salon,
    ServiceCategory,
    ServiceTemplate,
    Stylist,
    StylistDateRangeDiscount,
    StylistService,
)
from salon.tests.test_models import stylist_appointments_data
from salon.utils import create_stylist_profile_for_user


@pytest.fixture
def stylist_data() -> Stylist:
    salon = G(
        Salon,
        name='Test salon', address='2000 Rilma Lane', city='Los Altos', state='CA',
        zip_code='94022', latitude=37.4009997, longitude=-122.1185007, timezone=pytz.utc
    )

    stylist_user = G(
        User,
        is_staff=False, is_superuser=False, email='test_stylist@example.com',
        first_name='Fred', last_name='McBob', phone='(650) 350-1111',
        role=USER_ROLE.stylist,
    )

    stylist = create_stylist_profile_for_user(
        stylist_user,
        salon=salon,
    )

    return stylist


class TestStylistSerializer(object):
    @pytest.mark.django_db
    def test_stylist_serializer_representation(self, stylist_data: Stylist):
        serializer = StylistSerializer(instance=stylist_data)
        data = serializer.data
        assert(data['first_name'] == 'Fred' and data['last_name'] == 'McBob')
        assert(data['salon_name'] == 'Test salon')
        assert(data['id'] == stylist_data.id)

    @pytest.mark.django_db
    def test_stylist_serializer_update(self, stylist_data: Stylist):
        data = {
            'first_name': 'Jane',
            'last_name': 'McBob',
            'phone': '(650) 350-1111',
            'salon_name': 'Janes beauty',
            'salon_address': '1234 Front Street',
            # TODO: uncomment below lines when we enable address splitting
            # 'salon_city': 'Menlo Park',
            # 'salon_zipcode': '12345',
            # 'salon_state': 'CA',
        }
        # check case when there's no salon on stylist's profile update
        stylist_data.salon = None
        stylist_data.save()
        serializer = StylistSerializer(
            instance=stylist_data, data=data, context={'user': stylist_data.user}
        )
        serializer.is_valid(raise_exception=True)
        stylist = serializer.save()
        assert(stylist.salon is not None)
        assert(stylist.user.first_name == 'Jane')
        assert(stylist.salon.name == 'Janes beauty')

    @pytest.mark.django_db
    def test_stylist_create(self):
        user: User = G(
            User,
            email='stylist@example.com',
            role=USER_ROLE.stylist,
        )
        assert(user.is_stylist() is True)
        data = {
            'first_name': 'Jane',
            'last_name': 'McBob',
            'phone': '(650) 350-1111',
            'salon_name': 'Test salon',
            'salon_address': '1234 Front Street',
            # TODO: uncomment below lines when we enable address splitting
            # 'salon_city': 'Menlo Park',
            # 'salon_zipcode': '12345',
            # 'salon_state': 'CA',
        }
        assert(hasattr(user, 'stylist') is False)
        serializer = StylistSerializer(data=data, context={'user': user})
        serializer.is_valid(raise_exception=True)
        stylist: Stylist = serializer.save()
        assert(stylist is not None)
        assert(stylist.salon is not None)
        assert(stylist.user.id == user.id)
        assert(stylist.salon.name == 'Test salon')
        assert(stylist.salon.timezone == pytz.timezone('America/New_York'))
        assert(stylist.user.first_name == 'Jane')
        assert(stylist.available_days.count() == 7)


class TestStylistServiceSerializer(object):
    @pytest.mark.django_db
    def test_create(self):
        stylist: Stylist = G(Stylist)
        category: ServiceCategory = G(ServiceCategory)
        template: ServiceTemplate = G(
            ServiceTemplate,
            duration=datetime.timedelta(),
            name='service 1', category=category,
        )
        data = [
            {
                'name': 'service 1',
                'duration_minutes': 10,
                'base_price': 20,
                'is_enabled': True,
                'category_uuid': category.uuid
            }
        ]
        serializer = StylistServiceSerializer(
            data=data,
            context={'stylist': stylist},
            many=True
        )
        assert(serializer.is_valid(raise_exception=True))

        serializer.save()
        assert(StylistService.objects.count() == 1)
        service = StylistService.objects.last()
        assert(service.name == 'service 1')
        assert(service.duration == datetime.timedelta(minutes=10))
        assert(service.base_price == 20)
        assert(service.service_uuid == template.uuid)

    @pytest.mark.django_db
    def test_update(self):
        stylist = G(Stylist)
        category: ServiceCategory = G(ServiceCategory)
        stylist_service = G(
            StylistService,
            stylist=stylist,
            category=category,
            name='old name',
            duration=datetime.timedelta(0),
            base_price=10,
            is_enabled=True,
            deleted_at=None
        )
        old_service_uuid = stylist_service.service_uuid
        data = [
            {
                'id': stylist_service.id,
                'name': 'new name',
                'duration_minutes': 10,
                'base_price': 20,
                'is_enabled': True,
                'category_uuid': category.uuid
            }
        ]
        serializer = StylistServiceSerializer(
            data=data,
            context={'stylist': stylist},
            many=True
        )
        assert (serializer.is_valid(raise_exception=True))

        serializer.save()
        assert (StylistService.objects.count() == 1)
        service = StylistService.objects.last()
        assert (service.name == 'new name')
        assert (service.duration == datetime.timedelta(minutes=10))
        assert (service.base_price == 20)
        assert(old_service_uuid != service.service_uuid)


class TestStylistProfileCompletenessSerializer(object):
    @pytest.mark.django_db
    def test_completed_profile(self, stylist_data: Stylist):
        user = stylist_data.user
        assert(
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_personal_data'] is True
        )
        user.first_name = ''
        user.last_name = ''
        user.phone = ''
        user.save()
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_personal_data'] is False
        )
        user.phone = '12345'
        user.save()
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_personal_data'] is False
        )
        user.first_name = 'Fred'
        user.save()
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_personal_data'] is True
        )
        salon = stylist_data.salon
        salon.address = ''
        salon.save()
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_personal_data'] is False
        )

    @pytest.mark.django_db
    def test_profile_picture(self, stylist_data: Stylist):
        user = stylist_data.user
        user.photo = None
        user.save()
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_picture_set'] is False
        )
        user.photo = 'http://example.com/1.jpg'
        user.save()
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_picture_set'] is True
        )

    @pytest.mark.django_db
    def test_services_set(self, stylist_data: Stylist):
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_services_set'] is False
        )
        G(StylistService, stylist=stylist_data, duration=datetime.timedelta(0))
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_services_set'] is True
        )

    @pytest.mark.django_db
    def test_business_hours_set(self, stylist_data: Stylist):
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_business_hours_set'] is False
        )
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_business_hours_set'] is False
        )
        stylist_data.available_days.filter(weekday=2).update(
            weekday=2, is_available=True,
            work_start_at=datetime.time(8, 0), work_end_at=datetime.time(15, 0)
        )
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_business_hours_set'] is True
        )

    @pytest.mark.django_db
    def test_weekday_discounts_set(self, stylist_data: Stylist):
        assert(stylist_data.weekday_discounts.count() == 7)
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_weekday_discounts_set'] is False
        )
        stylist_data.weekday_discounts.filter(weekday=1).update(
            discount_percent=20
        )
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_weekday_discounts_set'] is True
        )

    @pytest.mark.django_db
    def test_other_discounts_set(self, stylist_data: Stylist):
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_other_discounts_set'] is False
        )
        stylist_data.first_time_book_discount_percent = 10
        stylist_data.save()
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_other_discounts_set'] is True
        )
        stylist_data.first_time_book_discount_percent = 0
        stylist_data.rebook_within_1_week_discount_percent = 10
        stylist_data.save()
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_other_discounts_set'] is True
        )
        stylist_data.first_time_book_discount_percent = 0
        stylist_data.rebook_within_1_week_discount_percent = 0
        stylist_data.save()
        G(
            StylistDateRangeDiscount, stylist=stylist_data,
            dates=DateRange(datetime.date(2018, 4, 8), datetime.date(2018, 4, 10))
        )
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_other_discounts_set'] is True
        )


class TestStylistAvailableWeekDaySerializer(object):

    @pytest.mark.django_db
    def test_create(self):
        stylist = G(Stylist)
        data = {
            'weekday_iso': 1,
            'is_available': True,
            'work_start_at': '8:00',
            'work_end_at': '15:30'
        }
        serializer = StylistAvailableWeekDaySerializer(
            data=data, context={'user': stylist.user}
        )
        assert(serializer.is_valid(raise_exception=False))
        available_day = serializer.save()
        assert(available_day.work_start_at == datetime.time(8, 0))
        assert(available_day.work_end_at == datetime.time(15, 30))
        assert(available_day.stylist == stylist)
        assert(available_day.is_available is True)

    @pytest.mark.django_db
    def test_validate(self):
        stylist = G(Stylist)
        data = {
            'weekday_iso': 1,
            'is_available': False,
        }
        serializer = StylistAvailableWeekDaySerializer(
            data=data, context={'user': stylist.user}
        )
        assert(serializer.is_valid(raise_exception=False) is True)

        data['is_available'] = True
        serializer = StylistAvailableWeekDaySerializer(
            data=data, context={'user': stylist.user}
        )
        assert (serializer.is_valid(raise_exception=False) is False)

        data['work_start_at'] = '8:00'
        serializer = StylistAvailableWeekDaySerializer(
            data=data, context={'user': stylist.user}
        )
        assert (serializer.is_valid(raise_exception=False) is False)

        data['work_end_at'] = '15:30'
        serializer = StylistAvailableWeekDaySerializer(
            data=data, context={'user': stylist.user}
        )
        assert (serializer.is_valid(raise_exception=False) is True)


class TestStylistDiscountsSerializer(object):

    @pytest.mark.django_db
    def test_save(self, stylist_data: Stylist):
        data = {
            'first_booking': 10,
            'rebook_within_1_week': 20,
            'rebook_within_2_weeks': 30,
            'weekdays': [
                {
                    'weekday': 1,
                    'discount_percent': 40
                },
                {
                    'weekday': 2,
                    'discount_percent': 50
                }
            ]

        }

        serializer = StylistDiscountsSerializer(
            instance=stylist_data, data=data
        )
        assert(serializer.is_valid() is True)
        stylist: Stylist = serializer.save()
        assert(stylist.first_time_book_discount_percent == 10)
        assert(stylist.rebook_within_1_week_discount_percent == 20)
        assert(stylist.rebook_within_2_weeks_discount_percent == 30)
        assert(stylist.weekday_discounts.filter(discount_percent=0).count() == 5)
        assert(stylist.weekday_discounts.get(weekday=1).discount_percent == 40)
        assert (stylist.weekday_discounts.get(weekday=2).discount_percent == 50)


class TestStylistTodaySerializer(object):
    @freeze_time('2018-05-14 13:30:00 UTC')
    @pytest.mark.django_db
    def test_today_appointments(self, stylist_data: Stylist):
        appointments = stylist_appointments_data(stylist_data)
        client = G(Client)
        appointments.update(
            {
                'past_unpaid_appointment': G(
                    Appointment, client=client, stylist=stylist_data,
                    datetime_start_at=stylist_data.salon.timezone.localize(
                        datetime.datetime(2018, 5, 14, 10, 20)),
                    duration=datetime.timedelta(minutes=30),
                    status=AppointmentStatus.NEW,
                ),
                'cancelled_by_client_past': G(
                    Appointment, client=client, stylist=stylist_data,
                    datetime_start_at=stylist_data.salon.timezone.localize(
                        datetime.datetime(2018, 5, 14, 10, 20)),
                    duration=datetime.timedelta(minutes=30),
                    status=AppointmentStatus.CANCELLED_BY_CLIENT,
                ),
                'cancelled_by_client_future': G(
                    Appointment, client=client, stylist=stylist_data,
                    datetime_start_at=stylist_data.salon.timezone.localize(
                        datetime.datetime(2018, 5, 14, 18, 20)),
                    duration=datetime.timedelta(minutes=30),
                    status=AppointmentStatus.CANCELLED_BY_CLIENT,
                ),
                'cancelled_by_stylist': G(
                    Appointment, client=client, stylist=stylist_data,
                    datetime_start_at=stylist_data.salon.timezone.localize(
                        datetime.datetime(2018, 5, 14, 15, 20)),
                    duration=datetime.timedelta(minutes=30),
                    status=AppointmentStatus.CANCELLED_BY_STYLIST,
                ),
                'past_paid_appointment': G(
                    Appointment, client=client, stylist=stylist_data,
                    datetime_start_at=stylist_data.salon.timezone.localize(
                        datetime.datetime(2018, 5, 14, 10, 20)),
                    duration=datetime.timedelta(minutes=30),
                    status=AppointmentStatus.CHECKED_OUT,
                ),
                'no_call_no_show': G(
                    Appointment, client=client, stylist=stylist_data,
                    datetime_start_at=stylist_data.salon.timezone.localize(
                        datetime.datetime(2018, 5, 14, 10, 20)),
                    duration=datetime.timedelta(minutes=30),
                    status=AppointmentStatus.NO_SHOW,
                )
            }
        )
        serializer = StylistTodaySerializer(instance=stylist_data)
        data = serializer.data
        today_appointments = data['today_appointments']
        assert(frozenset([a['uuid'] for a in today_appointments]) == frozenset([
            str(appointments['past_unpaid_appointment'].uuid),
            str(appointments['cancelled_by_client_future'].uuid),
            str(appointments['cancelled_by_client_past'].uuid),
            str(appointments['current_appointment'].uuid),
            str(appointments['past_appointment'].uuid),
            str(appointments['future_appointment'].uuid),
            str(appointments['late_night_appointment'].uuid),
        ]))
        assert(data['today_visits_count'] == 7)
        assert(data['week_visits_count'] == 8)
        assert(data['past_visits_count'] == 5)


class TestAppointmentSerializer(object):
    @freeze_time('2018-05-17 15:30:00 UTC')
    @pytest.mark.django_db
    def test_validate_start_time(self, stylist_data: Stylist):
        service: StylistService = G(
            StylistService,
            stylist=stylist_data, duration=datetime.timedelta(minutes=30),
            base_price=50
        )
        stylist_data.available_days.filter(weekday=Weekday.THURSDAY).update(
            is_available=True,
            work_start_at=datetime.time(8, 0),
            work_end_at=datetime.time(17, 0)
        )
        past_datetime: datetime.datetime = datetime.datetime(
            2018, 5, 17, 14, 00, tzinfo=pytz.utc)
        data = {
            'client_first_name': 'Fred',
            'client_last_name': 'McBob',
            'service_uuid': service.service_uuid,
            'datetime_start_at': past_datetime.isoformat()
        }
        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        serializer.is_valid()
        assert(serializer.is_valid(raise_exception=False) is False)
        assert(
            appointment_errors.ERR_APPOINTMENT_IN_THE_PAST in
            serializer.errors.get('datetime_start_at')
        )

        outside_working_hours: datetime.datetime = datetime.datetime(
            2018, 5, 17, 19, 00, tzinfo=pytz.utc)
        data = {
            'client_first_name': 'Fred',
            'client_last_name': 'McBob',
            'service_uuid': service.service_uuid,
            'datetime_start_at': outside_working_hours.isoformat()
        }
        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        assert (serializer.is_valid(raise_exception=False) is False)
        assert (
            appointment_errors.ERR_APPOINTMENT_OUTSIDE_WORKING_HOURS in
            serializer.errors.get('datetime_start_at')
        )

        available_time: datetime.datetime = datetime.datetime(
            2018, 5, 17, 16, 00, tzinfo=pytz.utc)

        data = {
            'client_first_name': 'Fred',
            'client_last_name': 'McBob',
            'service_uuid': service.service_uuid,
            'datetime_start_at': available_time.isoformat()
        }
        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        assert (serializer.is_valid(raise_exception=False) is True)

        # add another appointment to check intersection
        previous_appointment = G(
            Appointment, stylist=stylist_data,
            datetime_start_at=datetime.datetime(2018, 5, 17, 15, 50, tzinfo=pytz.utc),
            status=AppointmentStatus.NEW, duration=datetime.timedelta(minutes=30)
        )
        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        assert (serializer.is_valid(raise_exception=False) is False)
        assert (
            appointment_errors.ERR_APPOINTMENT_INTERSECTION in
            serializer.errors.get('datetime_start_at')
        )
        previous_appointment.delete()
        # check next appointment
        next_appointment = G(
            Appointment, stylist=stylist_data,
            datetime_start_at=datetime.datetime(2018, 5, 17, 16, 20, tzinfo=pytz.utc),
            status=AppointmentStatus.NEW, duration=datetime.timedelta(minutes=30)
        )
        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        assert (serializer.is_valid(raise_exception=False) is False)
        assert (
            appointment_errors.ERR_APPOINTMENT_INTERSECTION in
            serializer.errors.get('datetime_start_at')
        )
        next_appointment.delete()
        # try inner appointment
        G(
            Appointment, stylist=stylist_data,
            datetime_start_at=datetime.datetime(2018, 5, 17, 16, 10, tzinfo=pytz.utc),
            status=AppointmentStatus.NEW, duration=datetime.timedelta(minutes=10)
        )
        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        assert (serializer.is_valid(raise_exception=False) is False)
        assert (
            appointment_errors.ERR_APPOINTMENT_INTERSECTION in
            serializer.errors.get('datetime_start_at')
        )
        # force it!
        serializer = AppointmentSerializer(
            data=data, context={'stylist': stylist_data, 'force_start': True}
        )
        serializer.is_valid()
        assert (serializer.is_valid(raise_exception=False) is True)

    @freeze_time('2018-05-17 15:30:00 UTC')
    @pytest.mark.django_db
    def test_create_without_client(self, stylist_data: Stylist):
        service: StylistService = G(
            StylistService,
            stylist=stylist_data, duration=datetime.timedelta(minutes=30),
            base_price=50
        )
        stylist_data.available_days.filter(weekday=Weekday.THURSDAY).update(
            is_available=True,
            work_start_at=datetime.time(8, 0),
            work_end_at=datetime.time(17, 0)
        )
        available_time: datetime.datetime = datetime.datetime(
            2018, 5, 17, 16, 00, tzinfo=pytz.utc)

        data = {
            'client_first_name': 'Fred',
            'client_last_name': 'McBob',
            'service_uuid': service.service_uuid,
            'datetime_start_at': available_time.isoformat()
        }
        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        assert(serializer.is_valid() is True)
        appointment: Appointment = serializer.save()

        assert(appointment.service_name == service.name)
        assert(appointment.service_uuid == service.service_uuid)
        assert(appointment.regular_price == service.base_price)
        assert(appointment.duration == service.duration)
        assert(appointment.client_first_name == 'Fred')
        assert(appointment.client is None)
        assert(appointment.services.count() == 1)
        original_service: AppointmentService = appointment.services.first()
        assert(original_service.is_original is True)
        assert(original_service.regular_price == service.base_price)
        assert(original_service.service_uuid == service.service_uuid)
        assert(original_service.service_name == service.name)

    @freeze_time('2018-05-17 15:30:00 UTC')
    @pytest.mark.django_db
    def test_create_with_client(self, stylist_data: Stylist):
        service: StylistService = G(
            StylistService,
            stylist=stylist_data, duration=datetime.timedelta(minutes=30),
            base_price=50
        )
        stylist_data.available_days.filter(weekday=Weekday.THURSDAY).update(
            is_available=True,
            work_start_at=datetime.time(8, 0),
            work_end_at=datetime.time(17, 0)
        )
        available_time: datetime.datetime = datetime.datetime(
            2018, 5, 17, 16, 00, tzinfo=pytz.utc)
        client: Client = G(Client)
        data = {
            'client_uuid': client.uuid,
            'service_uuid': service.service_uuid,
            'datetime_start_at': available_time.isoformat()
        }
        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        assert(serializer.is_valid() is True)
        appointment: Appointment = serializer.save()

        assert(appointment.service_name == service.name)
        assert(appointment.service_uuid == service.service_uuid)
        assert(appointment.regular_price == service.base_price)
        assert(appointment.duration == service.duration)
        assert(appointment.client_first_name == client.user.first_name)
        assert(appointment.client == client)

        assert (appointment.services.count() == 1)
        original_service: AppointmentService = appointment.services.first()
        assert (original_service.is_original is True)
        assert (original_service.regular_price == service.base_price)
        assert (original_service.service_uuid == service.service_uuid)
        assert (original_service.service_name == service.name)
