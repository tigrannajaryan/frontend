import datetime

import uuid
from typing import Dict, Optional, Tuple

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404

from rest_framework import serializers

import appointment.error_constants as appointment_errors
from appointment.constants import APPOINTMENT_STYLIST_SETTABLE_STATUSES
from appointment.models import Appointment
from appointment.types import AppointmentStatus
from client.models import Client
from core.models import TemporaryFile, User
from core.types import Weekday
from salon.models import (
    Invitation,
    Salon,
    ServiceCategory,
    ServiceTemplate,
    ServiceTemplateSet,
    Stylist,
    StylistAvailableWeekDay,
    StylistService,
    StylistServicePhotoSample,
    StylistWeekdayDiscount,
)
from salon.utils import create_stylist_profile_for_user
from .constants import MAX_SERVICE_TEMPLATE_PREVIEW_COUNT
from .fields import DurationMinuteField


class StylistUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', ]


class SalonSerializer(serializers.ModelSerializer):
    profile_photo_url = serializers.CharField(source='get_photo_url', read_only=True)
    full_address = serializers.CharField(source='get_full_address', read_only=True)

    class Meta:
        model = Salon
        fields = [
            'name', 'address', 'city', 'zip_code', 'state', 'full_address', 'profile_photo_url',
        ]


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ['name', 'uuid', ]


class StylistServicePhotoSampleSerializer(serializers.ModelSerializer):
    url = serializers.CharField(read_only=True, source='photo.url')

    class Meta:
        model = StylistServicePhotoSample
        fields = ['url', ]


class StylistServiceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    duration_minutes = DurationMinuteField(source='duration')
    photo_samples = StylistServicePhotoSampleSerializer(
        many=True, read_only=True)
    base_price = serializers.DecimalField(
        coerce_to_string=False, max_digits=6, decimal_places=2
    )
    category_uuid = serializers.UUIDField(source='category.uuid')
    category_name = serializers.CharField(source='category.name', read_only=True)

    def validate_id(self, pk: Optional[int]) -> Optional[int]:
        if pk is not None:
            stylist = self.context['stylist']
            if not stylist.services.filter(pk=pk).exists():
                raise serializers.ValidationError(
                    'Stylist does not have service with id == {0}'.format(pk)
                )
        return pk

    def create(self, validated_data: Dict):
        stylist = self.context['stylist']
        data_to_save = validated_data.copy()
        data_to_save.update({'stylist': stylist})
        pk = data_to_save.pop('id', None)

        category_data = data_to_save.pop('category', {})
        category_uuid = category_data.get('uuid', None)
        category = get_object_or_404(ServiceCategory, uuid=category_uuid)

        # check if date from client actually matches a service template
        # if it does not - generate service uuid from scratch, otherwise assign from template
        service_uuid = uuid.uuid4()

        service_template = ServiceTemplate.objects.filter(
            name=data_to_save['name'],
            category=category
        ).last()

        if service_template:
            service_uuid = service_template.uuid

        data_to_save.update({'category': category, 'service_uuid': service_uuid})
        try:
            service = stylist.services.get(pk=pk)
            return self.update(service, data_to_save)
        except StylistService.DoesNotExist:
            return StylistService.objects.create(**data_to_save)

    class Meta:
        model = StylistService
        fields = [
            'id', 'name', 'description', 'base_price', 'duration_minutes',
            'is_enabled', 'photo_samples', 'category_uuid', 'category_name',
        ]


class StylistSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    salon_name = serializers.CharField(source='salon.name', allow_null=True)
    salon_address = serializers.CharField(source='salon.address', allow_null=True)

    # TODO: Enable address sub-fields as soon as we have proper address splitting mechanics

    # salon_city = serializers.CharField(source='salon.city', required=False)
    # salon_zipcode = serializers.CharField(source='salon.zip_code', required=False)
    # salon_state = serializers.CharField(source='salon.state', required=False)

    profile_photo_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    profile_photo_url = serializers.CharField(read_only=True, source='get_profile_photo_url')

    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    phone = serializers.CharField(source='user.phone')

    class Meta:
        model = Stylist
        fields = [
            'id', 'first_name', 'last_name', 'phone', 'profile_photo_url',
            'salon_name', 'salon_address', 'profile_photo_id',
        ]

    def validate_salon_name(self, salon_name: str) -> str:
        if not salon_name:
            raise serializers.ValidationError('This field is required')
        return salon_name

    def validate_salon_address(self, salon_address: str) -> str:
        if not salon_address:
            raise serializers.ValidationError('This field is required')
        return salon_address

    def update(self, stylist: Stylist, validated_data) -> Stylist:
        with transaction.atomic():
            user_data = validated_data.pop('user', {})
            if user_data:
                user_serializer = StylistUserSerializer(
                    instance=stylist.user, data=user_data, partial=True
                )
                if user_serializer.is_valid(raise_exception=True):
                    user_serializer.save()

            salon_data = validated_data.pop('salon', {})
            if salon_data:
                salon_serializer = SalonSerializer(
                    instance=stylist.salon, data=salon_data, partial=True
                )
                if salon_serializer.is_valid(raise_exception=True):
                    stylist.salon = salon_serializer.save()
            self._save_profile_photo(
                stylist.user, validated_data.get('profile_photo_id', None)
            )
        return super(StylistSerializer, self).update(stylist, validated_data)

    def create(self, validated_data) -> Stylist:
        user: User = self.context['user']

        if user and hasattr(user, 'stylist'):
            return self.update(user.stylist, validated_data)

        with transaction.atomic():
            user_data = validated_data.pop('user', {})
            if user_data:
                user_serializer = StylistUserSerializer(
                    instance=user, data=user_data
                )
                if user_serializer.is_valid(raise_exception=True):
                    user = user_serializer.save()

            salon_data = validated_data.pop('salon', {})
            salon_serializer = SalonSerializer(
                data=salon_data
            )
            salon_serializer.is_valid(raise_exception=True)
            salon = salon_serializer.save()
            profile_photo_id = validated_data.pop('profile_photo_id', None)
            stylist = create_stylist_profile_for_user(user, salon=salon)
            self._save_profile_photo(
                user, profile_photo_id
            )
            return stylist

    def _save_profile_photo(
            self, user: Optional[User], photo_uuid: Optional[str]
    ) -> None:
        if not user or not photo_uuid:
            return

        image_file_record: TemporaryFile = get_object_or_404(
            TemporaryFile,
            uuid=photo_uuid,
            uploaded_by=user
        )
        content_file = ContentFile(image_file_record.file.read())
        target_file_name = image_file_record.file.name
        user.photo.save(
            default_storage.get_available_name(target_file_name), content_file
        )
        image_file_record.file.close()


class ServiceTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceTemplate
        fields = ['name', ]


class ServiceTemplateDetailsSerializer(serializers.ModelSerializer):
    duration_minutes = DurationMinuteField(source='duration')
    base_price = serializers.DecimalField(
        coerce_to_string=False, max_digits=6, decimal_places=2)

    class Meta:
        model = ServiceTemplate
        fields = ['id', 'name', 'description', 'base_price', 'duration_minutes', ]


class ServiceTemplateSetListSerializer(serializers.ModelSerializer):
    services = serializers.SerializerMethodField()
    image_url = serializers.CharField(read_only=True, source='get_image_url')

    class Meta:
        model = ServiceTemplateSet
        fields = ['uuid', 'name', 'description', 'services', 'image_url', ]

    def get_services(self, template_set: ServiceTemplateSet):
        templates = template_set.templates.all()[:MAX_SERVICE_TEMPLATE_PREVIEW_COUNT]
        return ServiceTemplateSerializer(templates, many=True).data


class ServiceCategoryDetailsSerializer(serializers.ModelSerializer):

    services = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCategory
        fields = ['name', 'uuid', 'services']

    def get_services(self, service_category: ServiceCategory):
        templates = service_category.templates.order_by('-base_price')
        if 'service_template_set' in self.context:
            templates = templates.filter(templateset=self.context['service_template_set'])
        return ServiceTemplateDetailsSerializer(templates, many=True).data


class ServiceTemplateSetDetailsSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()
    image_url = serializers.CharField(read_only=True, source='get_image_url')

    class Meta:
        model = ServiceTemplateSet
        fields = ['id', 'name', 'description', 'categories', 'image_url']

    def get_categories(self, service_template_set: ServiceTemplateSet):
        category_queryset = ServiceCategory.objects.all().order_by(
            'name', 'uuid'
        ).distinct('name', 'uuid')
        return ServiceCategoryDetailsSerializer(
            category_queryset,
            context={'service_template_set': service_template_set},
            many=True
        ).data


class StylistServiceListSerializer(serializers.Serializer):
    """Serves for convenience of packing services under dictionary key"""
    services = StylistServiceSerializer(many=True)


class StylistProfileStatusSerializer(serializers.ModelSerializer):
    has_personal_data = serializers.SerializerMethodField()
    has_picture_set = serializers.SerializerMethodField()
    has_services_set = serializers.SerializerMethodField()
    has_business_hours_set = serializers.SerializerMethodField()
    has_weekday_discounts_set = serializers.SerializerMethodField()
    has_other_discounts_set = serializers.SerializerMethodField()
    has_invited_clients = serializers.SerializerMethodField()

    class Meta:
        model = Stylist
        fields = [
            'has_personal_data', 'has_picture_set', 'has_services_set',
            'has_business_hours_set', 'has_weekday_discounts_set', 'has_other_discounts_set',
            'has_invited_clients',
        ]

    def get_has_personal_data(self, stylist: Stylist) -> bool:
        full_name = stylist.get_full_name()
        has_name = full_name and len(full_name) > 1
        salon: Optional[Salon] = getattr(stylist, 'salon')
        has_address = salon and salon.address
        return bool(has_name and stylist.user.phone and has_address)

    def get_has_picture_set(self, stylist: Stylist) -> bool:
        return stylist.get_profile_photo_url() is not None

    def get_has_services_set(self, stylist: Stylist) -> bool:
        return stylist.services.exists()

    def get_has_business_hours_set(self, stylist: Stylist) -> bool:
        return stylist.available_days.filter(
            is_available=True,
            work_start_at__isnull=False,
            work_end_at__isnull=False
        ).exists()

    def get_has_weekday_discounts_set(self, stylist: Stylist) -> bool:
        return stylist.weekday_discounts.filter(discount_percent__gt=0).exists()

    def get_has_other_discounts_set(self, stylist: Stylist) -> bool:
        """Returns True if any of the miscellaneous discounts is set"""
        return any([
            stylist.first_time_book_discount_percent > 0,
            stylist.rebook_within_1_week_discount_percent > 0,
            stylist.rebook_within_2_weeks_discount_percent > 0,
            stylist.date_range_discounts.exists()
        ])

    def get_has_invited_clients(self, stylist: Stylist) -> bool:
        # We don't have model for this right now, so set to False
        # TODO: reflect actual state
        return False


class StylistAvailableWeekDaySerializer(serializers.ModelSerializer):
    label = serializers.CharField(read_only=True, source='get_weekday_display')
    weekday_iso = serializers.IntegerField(source='weekday')

    def validate(self, attrs):
        if attrs.get('is_available', False) is True:
            if not attrs.get('work_start_at', None) or not attrs.get('work_end_at', None):
                raise serializers.ValidationError('Day marked as available, but time is not set')
        else:
            attrs['work_start_at'] = None
            attrs['work_end_at'] = None
        return attrs

    def create(self, validated_data):
        weekday: Weekday = validated_data['weekday']
        stylist: Stylist = self.context['user'].stylist
        weekday_db = stylist.available_days.filter(weekday=weekday).last()
        if weekday_db:
            return self.update(weekday_db, validated_data)

        validated_data.update({
            'stylist': stylist
        })
        return super(StylistAvailableWeekDaySerializer, self).create(validated_data)

    class Meta:
        model = StylistAvailableWeekDay
        fields = ['weekday_iso', 'label', 'work_start_at', 'work_end_at', 'is_available', ]


class StylistAvailableWeekDayListSerializer(serializers.ModelSerializer):
    weekdays = serializers.SerializerMethodField()

    class Meta:
        model = Stylist
        fields = ['weekdays', ]

    def get_weekdays(self, stylist: Stylist):
        weekday_availability = [
            stylist.get_or_create_weekday_availability(Weekday(weekday))
            for weekday in range(1, 8)
        ]
        return StylistAvailableWeekDaySerializer(weekday_availability, many=True).data


class StylistWeekdayDiscountSerializer(serializers.ModelSerializer):
    discount_percent = serializers.IntegerField(
        min_value=0, max_value=100
    )
    weekday_verbose = serializers.CharField(source='get_weekday_display', read_only=True)

    class Meta:
        model = StylistWeekdayDiscount
        fields = ['weekday', 'weekday_verbose', 'discount_percent']


class StylistDiscountsSerializer(serializers.ModelSerializer):
    weekdays = StylistWeekdayDiscountSerializer(
        source='weekday_discounts', many=True
    )
    first_booking = serializers.IntegerField(
        source='first_time_book_discount_percent',
        min_value=0, max_value=100
    )
    rebook_within_1_week = serializers.IntegerField(
        source='rebook_within_1_week_discount_percent',
        min_value=0, max_value=100
    )
    rebook_within_2_weeks = serializers.IntegerField(
        source='rebook_within_2_weeks_discount_percent',
        min_value=0, max_value=100
    )

    def update(self, stylist: Stylist, validated_data):
        with transaction.atomic():
            if 'weekday_discounts' in validated_data:
                for weekday_discount in validated_data.pop('weekday_discounts', []):
                    instance = stylist.weekday_discounts.filter(
                        weekday=weekday_discount['weekday']
                    ).last()
                    discount_serializer = StylistWeekdayDiscountSerializer(
                        instance=instance, data=weekday_discount)
                    discount_serializer.is_valid(raise_exception=True)
                    discount_serializer.save(stylist=stylist)
            return super(StylistDiscountsSerializer, self).update(stylist, validated_data)

    class Meta:
        model = Stylist
        fields = [
            'weekdays', 'first_booking', 'rebook_within_1_week', 'rebook_within_2_weeks',
        ]


class AppointmentValidationMixin(object):

    def validate_datetime_start_at(self, datetime_start_at: datetime.datetime):
        context: Dict = getattr(self, 'context', {})
        initial_data: Dict = getattr(self, 'initial_data', {})
        if context.get('force_start', False):
            return datetime_start_at

        stylist: Stylist = context['stylist']
        # check if appointment start is in the past
        if datetime_start_at < stylist.get_current_now():
            raise serializers.ValidationError(
                appointment_errors.ERR_APPOINTMENT_IN_THE_PAST
            )
        # check if appointment doesn't fit working hours
        service: Optional[StylistService] = stylist.services.filter(
            service_uuid=initial_data['service_uuid']
        ).last()

        # if service is not found (which must be checked elsewhere) - just return
        if not service:
            return datetime_start_at

        if not stylist.is_working_time(datetime_start_at, service.duration):
            raise serializers.ValidationError(
                appointment_errors.ERR_APPOINTMENT_OUTSIDE_WORKING_HOURS
            )
        # check if there are intersecting appointments
        if stylist.get_appointments_in_datetime_range(
            datetime_start_at, datetime_start_at + service.duration
        ).exists():
            raise serializers.ValidationError(
                appointment_errors.ERR_APPOINTMENT_INTERSECTION
            )
        return datetime_start_at

    def validate_service_uuid(self, service_uuid: str):
        context: Dict = getattr(self, 'context', {})
        stylist: Stylist = context['stylist']
        service = stylist.services.filter(
            service_uuid=service_uuid
        ).last()
        if not service:
            raise serializers.ValidationError(
                appointment_errors.ERR_SERVICE_DOES_NOT_EXIST
            )
        return service_uuid

    def validate_client_uuid(self, client_uuid: Optional[str]):
        if client_uuid:
            if not Client.objects.filter(uuid=client_uuid).exists():
                raise serializers.ValidationError(
                    appointment_errors.ERR_CLIENT_DOES_NOT_EXIST
                )
        return client_uuid


class AppointmentSerializer(AppointmentValidationMixin, serializers.ModelSerializer):
    uuid = serializers.UUIDField(read_only=True)

    client_uuid = serializers.UUIDField(source='client.uuid', allow_null=True, required=False)
    client_first_name = serializers.CharField(
        allow_null=True, allow_blank=True, required=False
    )
    client_last_name = serializers.CharField(
        allow_null=True, allow_blank=True, required=False
    )
    client_phone = serializers.CharField(
        source='client.user.phone', allow_null=True, allow_blank=True, read_only=True
    )

    regular_price = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True
    )
    client_price = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True
    )

    service_name = serializers.CharField(allow_null=True, allow_blank=True, read_only=True)
    service_uuid = serializers.UUIDField(required=True)

    datetime_start_at = serializers.DateTimeField()
    duration_minutes = DurationMinuteField(source='duration', read_only=True)

    # status will be read-only in this serializer, to avoid arbitrary setting
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'uuid', 'client_uuid', 'client_first_name', 'client_last_name',
            'client_phone', 'regular_price', 'client_price', 'service_name',
            'service_uuid', 'datetime_start_at', 'duration_minutes', 'status',
        ]

    def create(self, validated_data):
        data = validated_data.copy()
        stylist: Stylist = self.context['stylist']
        service: StylistService = stylist.services.get(
            service_uuid=data['service_uuid']
        )

        client = None
        client_data = validated_data.pop('client', {})
        client_uuid = client_data.get('uuid', None)
        if client_uuid:
            client: Client = Client.objects.filter(
                uuid=client_uuid
            ).last()

            if client:
                data['client_last_name'] = client.user.last_name
                data['client_first_name'] = client.user.first_name
                data['client'] = client

        data['created_by'] = stylist.user
        data['stylist'] = stylist

        # regular price copied from service, client's price is calculated
        data['regular_price'] = service.base_price
        datetime_start_at: datetime.datetime = data['datetime_start_at']
        data['client_price'] = int(service.calculate_price_for_client(
            datetime_start_at=datetime_start_at,
            client=client
        ))
        data['service_name'] = service.name
        data['duration'] = service.duration

        return super(AppointmentSerializer, self).create(data)


class AppointmentPreviewSerializer(serializers.ModelSerializer):
    datetime_end_at = serializers.SerializerMethodField()
    duration_minutes = DurationMinuteField(source='duration', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'uuid', 'client_first_name', 'client_last_name', 'service_name',
            'datetime_start_at', 'datetime_end_at', 'duration_minutes',
        ]

    def get_datetime_end_at(self, appointment: Appointment):
        datetime_end_at = appointment.datetime_start_at + appointment.duration
        return serializers.DateTimeField().to_representation(datetime_end_at)


class AppointmentPreviewRequestSerializer(AppointmentValidationMixin, serializers.Serializer):
    client_uuid = serializers.UUIDField(
        allow_null=True, required=False
    )
    service_uuid = serializers.UUIDField(required=True)
    datetime_start_at = serializers.DateTimeField()


class AppointmentPreviewResponseSerializer(serializers.Serializer):
    regular_price = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True,
    )
    client_price = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True
    )
    duration_minutes = DurationMinuteField(source='duration', read_only=True)
    conflicts_with = AppointmentPreviewSerializer(many=True)


class StylistAppointmentStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = ['status', ]

    def validate_status(self, status: AppointmentStatus) -> AppointmentStatus:
        if status not in APPOINTMENT_STYLIST_SETTABLE_STATUSES:
            raise serializers.ValidationError(
                appointment_errors.ERR_STATUS_NOT_ALLOWED
            )
        return status

    def save(self, **kwargs):
        status = self.validated_data['status']
        user: User = self.context['user']
        appointment: Appointment = self.instance
        appointment.set_status(status, user)
        return appointment


class StylistTodaySerializer(serializers.ModelSerializer):
    next_appointments = serializers.SerializerMethodField()
    today_visits_count = serializers.SerializerMethodField()
    week_visits_count = serializers.SerializerMethodField()
    past_visits_count = serializers.SerializerMethodField()

    class Meta:
        model = Stylist
        fields = [
            'next_appointments', 'today_visits_count', 'week_visits_count', 'past_visits_count',
        ]

    def _get_week_bounds(
            self, stylist: Stylist
    ) -> Tuple[datetime.datetime, datetime.datetime]:
        current_now = stylist.get_current_now()
        week_start: datetime.datetime = (
            current_now - datetime.timedelta(
                days=current_now.isoweekday() - 1
            )
        ).replace(hour=0, minute=0, second=0)
        week_end: datetime.datetime = (
            current_now + datetime.timedelta(
                days=7 - current_now.isoweekday() + 1
            )
        ).replace(hour=0, minute=0, second=0)
        return week_start, week_end

    def get_next_appointments(self, stylist: Stylist):
        """Return data for current, and if exists - next appointment"""
        stylist_current_time = stylist.get_current_now()
        next_midnight = (
            stylist_current_time + datetime.timedelta(days=1)
        ).replace(hour=0, minute=0, second=0)
        next_appointments = stylist.get_appointments_in_datetime_range(
            datetime_from=stylist_current_time,
            datetime_to=next_midnight
        )[:2]
        if next_appointments.count():
            if next_appointments.first().datetime_start_at > stylist_current_time:
                # there's literally no *current* appointment, so we'll limit
                # the query to just one next appointment
                next_appointments = next_appointments[:1]
        return AppointmentSerializer(
            next_appointments, many=True
        ).data

    def get_today_visits_count(self, stylist: Stylist):
        return stylist.get_today_appointments(upcoming_only=False).count()

    def get_week_visits_count(self, stylist: Stylist):
        week_start, week_end = self._get_week_bounds(stylist)
        return stylist.get_appointments_in_datetime_range(
            datetime_from=week_start,
            datetime_to=week_end,
            include_cancelled=False
        ).count()

    def get_past_visits_count(self, stylist: Stylist):
        return stylist.get_appointments_in_datetime_range(
            datetime_from=None,
            datetime_to=stylist.get_current_now(),
            include_cancelled=False
        ).exclude(
            datetime_start_at__gt=stylist.get_current_now() - F('duration')
        ).count()


class InvitationSerializer(serializers.ModelSerializer):

    phone = serializers.CharField(required=True)

    class Meta:
        model = Invitation
        fields = ['phone', ]
