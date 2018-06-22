import datetime

import mock
import pytest
import pytz

from django_dynamic_fixture import G
from freezegun import freeze_time

import appointment.error_constants as appointment_errors
from api.v1.stylist.serializers import (
    AppointmentSerializer,
    AppointmentUpdateSerializer,
    StylistAvailableWeekDaySerializer,
    StylistAvailableWeekDayWithBookedTimeSerializer,
    StylistDiscountsSerializer,
    StylistProfileStatusSerializer,
    StylistSerializer,
    StylistServiceSerializer,
    StylistSettingsRetrieveSerializer,
    StylistTodaySerializer,
)
from appointment.models import Appointment, AppointmentService
from appointment.types import AppointmentStatus
from client.models import ClientOfStylist
from core.choices import USER_ROLE
from core.models import User
from core.types import UserRole, Weekday
from core.utils import calculate_card_fee, calculate_tax
from pricing import CalculatedPrice
from salon.models import (
    Salon,
    ServiceCategory,
    ServiceTemplate,
    Stylist,
    StylistService,
)
from salon.tests.test_models import stylist_appointments_data
from salon.utils import (
    create_stylist_profile_for_user,
)


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

    @pytest.mark.django_db
    def test_stylist_create_without_salon_name(self):
        user: User = G(
            User,
            email='stylist@example.com',
            role=USER_ROLE.stylist,
        )
        assert (user.is_stylist() is True)
        data = {
            'first_name': 'Jane',
            'last_name': 'McBob',
            'phone': '(650) 350-1111',
            'salon_address': '1234 Front Street',
            'salon_name': None,
        }
        assert (hasattr(user, 'stylist') is False)
        serializer = StylistSerializer(data=data, context={'user': user})
        serializer.is_valid(raise_exception=True)
        stylist: Stylist = serializer.save()
        assert(stylist.salon.__str__() == '[No name] (1234 Front Street)')


class TestStylistServiceSerializer(object):
    @pytest.mark.django_db
    def test_create(self):
        stylist: Stylist = G(Stylist)
        category: ServiceCategory = G(ServiceCategory)
        template: ServiceTemplate = G(
            ServiceTemplate,
            name='service 1', category=category,
            duration=datetime.timedelta(minutes=10),
            regular_price=20
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
            many=True,
        )
        assert(serializer.is_valid(raise_exception=True))

        serializer.save()
        assert(StylistService.objects.count() == 1)
        service = StylistService.objects.last()
        assert(service.name == 'service 1')
        assert(service.duration == datetime.timedelta(minutes=10))
        assert(service.regular_price == 20)
        assert(service.service_origin_uuid == template.uuid)

    @pytest.mark.django_db
    def test_update(self):
        stylist = G(Stylist)
        category: ServiceCategory = G(ServiceCategory)
        template: ServiceTemplate = G(
            ServiceTemplate,
            name='old_name', category=category,
            duration=datetime.timedelta(minutes=10),
            regular_price=20
        )
        stylist_service = G(
            StylistService,
            stylist=stylist,
            category=category,
            name='old name',
            duration=datetime.timedelta(10),
            regular_price=20,
            is_enabled=True,
            deleted_at=None,
            service_origin_uuid=template.uuid
        )
        old_service_uuid = stylist_service.uuid
        old_service_origin_uuid = stylist_service.service_origin_uuid
        data = [
            {
                'uuid': stylist_service.uuid,
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
        assert (service.regular_price == 20)
        assert (old_service_uuid == service.uuid)
        assert (old_service_origin_uuid != service.service_origin_uuid)


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
        data = {
            'weekdays': [
                {
                    'weekday': 1,
                    'discount_percent': 10
                }
            ]
        }
        serializer = StylistDiscountsSerializer(
            instance=stylist_data, data=data, partial=True
        )
        assert(serializer.is_valid() is True)
        stylist_data = serializer.save()
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
        data = {
            'first_booking': 10
        }
        serializer = StylistDiscountsSerializer(
            instance=stylist_data, data=data, partial=True
        )
        assert (serializer.is_valid() is True)
        stylist_data = serializer.save()
        assert (
            StylistProfileStatusSerializer(
                instance=stylist_data).data['has_weekday_discounts_set'] is True
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
        assert(stylist.weekday_discounts.get(weekday=1).discount_percent == 40)
        assert (stylist.weekday_discounts.get(weekday=2).discount_percent == 50)


class TestStylistTodaySerializer(object):
    @freeze_time('2018-05-14 13:30:00 UTC')
    @pytest.mark.django_db
    def test_today_appointments(self, stylist_data: Stylist):
        appointments = stylist_appointments_data(stylist_data)
        client = G(ClientOfStylist)
        appointments.update(
            {
                'cancelled_by_client_past': G(
                    Appointment, client=client, stylist=stylist_data,
                    datetime_start_at=stylist_data.salon.timezone.localize(
                        datetime.datetime(2018, 5, 14, 10, 20)),
                    status=AppointmentStatus.CANCELLED_BY_CLIENT,
                ),
                'cancelled_by_client_future': G(
                    Appointment, client=client, stylist=stylist_data,
                    datetime_start_at=stylist_data.salon.timezone.localize(
                        datetime.datetime(2018, 5, 14, 18, 20)),
                    status=AppointmentStatus.CANCELLED_BY_CLIENT,
                ),
                'cancelled_by_stylist': G(
                    Appointment, client=client, stylist=stylist_data,
                    datetime_start_at=stylist_data.salon.timezone.localize(
                        datetime.datetime(2018, 5, 14, 15, 20)),
                    status=AppointmentStatus.CANCELLED_BY_STYLIST,
                ),
                'past_paid_appointment': G(
                    Appointment, client=client, stylist=stylist_data,
                    datetime_start_at=stylist_data.salon.timezone.localize(
                        datetime.datetime(2018, 5, 14, 10, 20)),
                    status=AppointmentStatus.CHECKED_OUT,
                ),
                'no_call_no_show': G(
                    Appointment, client=client, stylist=stylist_data,
                    datetime_start_at=stylist_data.salon.timezone.localize(
                        datetime.datetime(2018, 5, 14, 10, 20)),
                    status=AppointmentStatus.NO_SHOW,
                )
            }
        )
        serializer = StylistTodaySerializer(instance=stylist_data)
        data = serializer.data
        today_appointments = data['today_appointments']
        assert(frozenset([a['uuid'] for a in today_appointments]) == frozenset([
            str(appointments['cancelled_by_client_future'].uuid),
            str(appointments['cancelled_by_client_past'].uuid),
            str(appointments['current_appointment'].uuid),
            str(appointments['past_appointment'].uuid),  # unpaid yet
            str(appointments['future_appointment'].uuid),
            str(appointments['late_night_appointment'].uuid),
        ]))
        assert(data['today_visits_count'] == 3)
        assert(data['week_visits_count'] == 4)
        assert(data['past_visits_count'] == 4)


class TestAppointmentSerializer(object):
    @freeze_time('2018-05-17 15:30:00 UTC')
    @pytest.mark.django_db
    def test_validate_start_time(self, stylist_data: Stylist):
        stylist_data.service_time_gap = datetime.timedelta(minutes=30)
        stylist_data.save(update_fields=['service_time_gap'])
        service: StylistService = G(
            StylistService,
            stylist=stylist_data, duration=datetime.timedelta(minutes=30),
            regular_price=50
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
            'client_phone': '12345',
            'services': [
                {
                    'service_uuid': service.uuid,
                }
            ],
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
            'client_phone': '12345',
            'services': [
                {
                    'service_uuid': service.uuid,
                }
            ],
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
            'client_phone': '12345',
            'services': [
                {
                    'service_uuid': service.uuid,
                }
            ],
            'datetime_start_at': available_time.isoformat()
        }
        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        assert (serializer.is_valid(raise_exception=False) is True)

        # add another appointment to check intersection
        previous_appointment = G(
            Appointment, stylist=stylist_data,
            datetime_start_at=datetime.datetime(2018, 5, 17, 15, 50, tzinfo=pytz.utc),
            status=AppointmentStatus.NEW
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
            status=AppointmentStatus.NEW,
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
            status=AppointmentStatus.NEW
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
    def test_create_without_client(self, stylist_data: Stylist, mocker):
        calculate_mock = mocker.patch(
            'api.v1.stylist.serializers.calculate_price_and_discount_for_client_on_date',
            mock.Mock()
        )
        calculate_mock.return_value = CalculatedPrice.build(
            price=30, applied_discount=None, discount_percentage=0
        )
        service: StylistService = G(
            StylistService,
            stylist=stylist_data, duration=datetime.timedelta(minutes=30),
            regular_price=50
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
            'client_phone': '12345',
            'services': [
                {
                    'service_uuid': service.uuid,
                },
            ],
            'datetime_start_at': available_time.isoformat()
        }
        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        assert(serializer.is_valid() is True)
        appointment: Appointment = serializer.save()

        assert(appointment.total_client_price_before_tax == 30)
        assert(appointment.duration == service.duration)
        assert(appointment.client_first_name == 'Fred')
        assert(appointment.client is not None)
        client: ClientOfStylist = appointment.client
        assert(client.first_name == 'Fred')
        assert(client.phone == '12345')
        assert(appointment.services.count() == 1)
        original_service: AppointmentService = appointment.services.first()
        assert(original_service.is_original is True)
        assert(original_service.regular_price == service.regular_price)
        assert(original_service.client_price == 30)
        assert(original_service.service_uuid == service.uuid)
        assert(original_service.service_name == service.name)

    @freeze_time('2018-05-17 15:30:00 UTC')
    @pytest.mark.django_db
    def test_create_with_client(self, stylist_data: Stylist, mocker):
        service: StylistService = G(
            StylistService,
            stylist=stylist_data, duration=datetime.timedelta(minutes=30),
            regular_price=50
        )
        stylist_data.available_days.filter(weekday=Weekday.THURSDAY).update(
            is_available=True,
            work_start_at=datetime.time(8, 0),
            work_end_at=datetime.time(17, 0)
        )
        calculate_mock = mocker.patch(
            'api.v1.stylist.serializers.calculate_price_and_discount_for_client_on_date',
            mock.Mock()
        )
        calculate_mock.return_value = CalculatedPrice.build(
            price=30, applied_discount=None, discount_percentage=0
        )
        available_time: datetime.datetime = datetime.datetime(
            2018, 5, 17, 16, 00, tzinfo=pytz.utc)
        client: ClientOfStylist = G(ClientOfStylist)
        data = {
            'client_uuid': client.uuid,
            'services': [
                {
                    'service_uuid': service.uuid,
                },
            ],
            'datetime_start_at': available_time.isoformat()
        }
        # check client which is not related to stylist, i.e. no prior appointments
        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        assert(serializer.is_valid() is False)
        assert('client_uuid' in serializer.errors)

        G(
            Appointment,
            client=client, stylist=stylist_data, created_by=stylist_data.user,
            datetime_start_at=stylist_data.with_salon_tz(datetime.datetime(2018, 5, 15, 15, 30))
        )

        serializer = AppointmentSerializer(data=data, context={'stylist': stylist_data})
        assert (serializer.is_valid() is True)
        appointment: Appointment = serializer.save()

        assert (
            appointment.total_client_price_before_tax == 30
        )
        assert(appointment.duration == service.duration)
        assert(appointment.client_first_name == client.first_name)
        assert(appointment.client == client)

        assert (appointment.services.count() == 1)
        original_service: AppointmentService = appointment.services.first()
        assert (original_service.is_original is True)
        assert (original_service.regular_price == service.regular_price)
        assert (original_service.client_price == 30)
        assert (original_service.service_uuid == service.uuid)
        assert (original_service.service_name == service.name)

    @freeze_time('2018-05-17 15:30:00 UTC')
    @pytest.mark.django_db
    def test_create_pricing(self, stylist_data: Stylist):
        from salon.models import StylistAvailableWeekDay
        from salon.utils import calculate_price_and_discount_for_client_on_date
        service: StylistService = G(
            StylistService,
            stylist=stylist_data,
            regular_price=200,
            duration=datetime.timedelta()
        )
        appointment_start: datetime.datetime = stylist_data.with_salon_tz(
            datetime.datetime(2018, 5, 17, 15, 00)
        )
        client = G(ClientOfStylist)

        # associate client with stylist
        G(Appointment, stylist=stylist_data, client=client,
          datetime_start_at=stylist_data.with_salon_tz(
              datetime.datetime(2018, 5, 10, 15, 00)
          ))
        stylist_data.available_days.filter(weekday=Weekday.THURSDAY).delete()
        G(StylistAvailableWeekDay, weekday=Weekday.THURSDAY,
          work_start_at=datetime.time(8, 0), work_end_at=datetime.time(12, 00),
          is_available=True, stylist=stylist_data
          )

        for i in range(0, 9):
            appointment_data = {
                'client_uuid': client.uuid,
                'services': [
                    {
                        'service_uuid': service.uuid,
                    },
                ],
                'datetime_start_at': (
                    appointment_start
                ).isoformat()
            }

            calculated_price: CalculatedPrice = calculate_price_and_discount_for_client_on_date(
                service=service, client=client, date=appointment_start.date()
            )
            appointment_serializer = AppointmentSerializer(
                data=appointment_data, context={'stylist': stylist_data, 'force_start': True}
            )
            assert(appointment_serializer.is_valid(raise_exception=False) is True)
            appointment: Appointment = appointment_serializer.save()
            appointment_service: AppointmentService = appointment.services.first()
            assert(calculated_price.price == appointment_service.client_price)


class TestAppointmentUpdateSerializer(object):

    @pytest.mark.django_db
    def test_validate_status(self):
        appointment = G(
            Appointment,
            duration=datetime.timedelta(minutes=30)
        )
        data = {
            'status': AppointmentStatus.CANCELLED_BY_CLIENT.value
        }
        serializer = AppointmentUpdateSerializer(instance=appointment, data=data)
        assert(serializer.is_valid() is False)
        assert(
            appointment_errors.ERR_STATUS_NOT_ALLOWED in
            serializer.errors['status']
        )
        data = {
            'status': AppointmentStatus.CANCELLED_BY_STYLIST.value
        }
        serializer = AppointmentUpdateSerializer(instance=appointment, data=data)
        assert(serializer.is_valid() is True)
        data = {
            'status': AppointmentStatus.CHECKED_OUT.value
        }
        serializer = AppointmentUpdateSerializer(instance=appointment, data=data)
        assert (serializer.is_valid() is False)
        assert (
            appointment_errors.ERR_SERVICE_REQUIRED in
            serializer.errors['services']
        )

    @pytest.mark.django_db
    def test_validate_services(self):
        appointment = G(
            Appointment,
            duration=datetime.timedelta(minutes=30)
        )
        stylist_service = G(
            StylistService,
            stylist=appointment.stylist,
            duration=datetime.timedelta(minutes=30)
        )
        appointment_service_valid = G(
            AppointmentService,
            duration=stylist_service.duration,
            service_uuid=stylist_service.uuid,
        )
        appointment_service_invalid = G(
            AppointmentService,
            duration=stylist_service.duration,
        )
        context = {
            'stylist': stylist_service.stylist,
            'user': stylist_service.stylist.user
        }

        data = {
            'status': AppointmentStatus.CHECKED_OUT.value
        }
        serializer = AppointmentUpdateSerializer(instance=appointment, data=data)
        assert (serializer.is_valid() is False)

        data = {
            'status': AppointmentStatus.CHECKED_OUT.value,
            'services': [
                {'service_uuid': appointment_service_valid.service_uuid}
            ],
            'has_tax_included': False,
            'has_card_fee_included': False
        }
        serializer = AppointmentUpdateSerializer(instance=appointment, data=data, context=context)
        assert (serializer.is_valid() is True)

        data = {
            'status': AppointmentStatus.CHECKED_OUT.value,
            'services': [
                {'service_uuid': appointment_service_invalid.service_uuid}
            ]
        }
        serializer = AppointmentUpdateSerializer(instance=appointment, data=data, context=context)
        assert (serializer.is_valid() is False)
        assert (
            appointment_errors.ERR_SERVICE_DOES_NOT_EXIST in
            serializer.errors['services']
        )
        appointment.status = AppointmentStatus.CHECKED_OUT
        appointment.save()

        data = {
            'status': AppointmentStatus.CHECKED_OUT.value,
            'services': [
                {'service_uuid': appointment_service_valid.service_uuid}
            ],
            'has_tax_included': False,
            'has_card_fee_included': False
        }
        serializer = AppointmentUpdateSerializer(instance=appointment, data=data, context=context)
        assert (serializer.is_valid() is False)
        assert (
            appointment_errors.ERR_NO_SECOND_CHECKOUT in
            serializer.errors['status']
        )

    @pytest.mark.django_db
    def test_save_non_checked_out_status(self):
        salon = G(Salon, timezone=pytz.utc)
        stylist = G(Stylist, salon=salon)
        appointment = G(
            Appointment,
            stylist=stylist,
            duration=datetime.timedelta(minutes=30)
        )
        context = {
            'stylist': appointment.stylist,
            'user': appointment.stylist.user
        }
        assert(appointment.status == AppointmentStatus.NEW)
        data = {
            'status': AppointmentStatus.CANCELLED_BY_STYLIST.value
        }
        serializer = AppointmentUpdateSerializer(instance=appointment, data=data, context=context)
        assert(serializer.is_valid())
        appointment = serializer.save()
        assert(appointment.status == AppointmentStatus.CANCELLED_BY_STYLIST)

    @pytest.mark.django_db
    def test_save_checked_out_status(self, mocker):
        calculate_mock = mocker.patch(
            'api.v1.stylist.serializers.calculate_price_and_discount_for_client_on_date',
            mock.Mock()
        )
        calculate_mock.return_value = CalculatedPrice.build(
            price=30, applied_discount=None, discount_percentage=0
        )
        salon = G(Salon, timezone=pytz.utc)
        stylist = G(Stylist, salon=salon)
        appointment = G(
            Appointment,
            stylist=stylist,
            duration=datetime.timedelta(minutes=30)
        )
        context = {
            'stylist': appointment.stylist,
            'user': appointment.stylist.user
        }
        original_service: StylistService = G(
            StylistService, stylist=appointment.stylist,
            duration=datetime.timedelta(30),
            regular_price=20
        )
        G(
            AppointmentService, appointment=appointment,
            service_uuid=original_service.uuid, service_name=original_service.name,
            duration=original_service.duration, is_original=True,
            regular_price=20, client_price=18
        )

        new_service: StylistService = G(
            StylistService, stylist=appointment.stylist,
            duration=datetime.timedelta(30),
            regular_price=40
        )

        assert(appointment.services.count() == 1)

        data = {
            'status': AppointmentStatus.CHECKED_OUT.value,
            'services': [
                {
                    'service_uuid': original_service.uuid
                },
                {
                    'service_uuid': new_service.uuid
                }
            ],
            'has_tax_included': False,
            'has_card_fee_included': False
        }

        serializer = AppointmentUpdateSerializer(
            instance=appointment, data=data, context=context
        )
        assert(serializer.is_valid() is True)
        saved_appointment = serializer.save()
        assert(saved_appointment.services.count() == 2)
        original_appointment_service: AppointmentService = saved_appointment.services.get(
            is_original=True
        )
        assert(original_appointment_service.service_uuid == original_service.uuid)
        assert(original_appointment_service.client_price == 18)
        assert(original_appointment_service.regular_price == 20)

        added_appointment_service: AppointmentService = saved_appointment.services.get(
            is_original=False
        )
        assert(added_appointment_service.service_uuid == new_service.uuid)
        assert(added_appointment_service.client_price == 40)
        assert(added_appointment_service.regular_price == 40)

        assert(saved_appointment.has_card_fee_included is False)
        assert(saved_appointment.has_tax_included is False)
        total_services_cost = sum([s.client_price for s in saved_appointment.services.all()], 0)
        assert(saved_appointment.total_client_price_before_tax == total_services_cost)
        assert(saved_appointment.grand_total == total_services_cost)
        assert(saved_appointment.total_tax == calculate_tax(total_services_cost))
        assert(saved_appointment.total_card_fee == calculate_card_fee(total_services_cost))


class TestStylistAvailableWeekDayWithBookedTimeSerializer(object):
    @freeze_time('2018-05-14 13:30:00 UTC')
    @pytest.mark.django_db
    def test_get_booked_time_and_count(self):
        user = G(User, role=UserRole.STYLIST)
        salon = G(Salon, timezone=pytz.utc)
        stylist = create_stylist_profile_for_user(
            user, salon=salon, service_time_gap=datetime.timedelta(minutes=30)
        )
        stylist_appointments_data(stylist)
        monday = stylist.available_days.get(weekday=Weekday.MONDAY)
        serializer = StylistAvailableWeekDayWithBookedTimeSerializer(
            monday
        )
        data = serializer.data
        assert(data['booked_time_minutes'] == 120)
        assert(data['booked_appointments_count'] == 4)

        tuesday = stylist.available_days.get(weekday=Weekday.TUESDAY)
        serializer = StylistAvailableWeekDayWithBookedTimeSerializer(
            tuesday
        )
        data = serializer.data
        assert (data['booked_time_minutes'] == 30)
        assert (data['booked_appointments_count'] == 1)


class TestStylistSettingsRetrieveSerializer(object):
    @freeze_time('2018-05-14 13:30:00 UTC')
    @pytest.mark.django_db
    def test_get_total_booked_time_and_count(self):
        user = G(User, role=UserRole.STYLIST)
        salon = G(Salon, timezone=pytz.utc)
        stylist = create_stylist_profile_for_user(
            user, salon=salon, service_time_gap=datetime.timedelta(minutes=30))
        stylist_appointments_data(stylist)
        serializer = StylistSettingsRetrieveSerializer(stylist)
        data = serializer.data
        assert (data['total_week_booked_minutes'] == 150)
        assert (data['total_week_appointments_count'] == 5)
