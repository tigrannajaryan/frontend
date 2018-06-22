import datetime
import uuid
from decimal import Decimal
from math import trunc
from typing import Dict, List, Optional, Tuple

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import Coalesce, ExtractWeekDay
from django.shortcuts import get_object_or_404

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

import appointment.error_constants as appointment_errors
from appointment.constants import APPOINTMENT_STYLIST_SETTABLE_STATUSES
from appointment.models import Appointment, AppointmentService
from appointment.types import AppointmentStatus
from client.models import ClientOfStylist
from core.models import TemporaryFile, User
from core.types import AppointmentPrices, Weekday
from core.utils import (
    calculate_appointment_prices,
)
from pricing import CalculatedPrice
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
from salon.utils import (
    calculate_price_and_discount_for_client_on_date,
    create_stylist_profile_for_user,
    generate_prices_for_stylist_service,
)
from .constants import ErrorMessages, MAX_SERVICE_TEMPLATE_PREVIEW_COUNT
from .fields import DurationMinuteField


class StylistUserSerializer(serializers.ModelSerializer):

    phone = serializers.CharField(
        validators=[UniqueValidator(
            queryset=User.objects.all(),
            message=ErrorMessages.UNIQUE_STYLIST_PHONE)])

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
    duration_minutes = DurationMinuteField(source='duration')
    photo_samples = StylistServicePhotoSampleSerializer(
        many=True, read_only=True)
    base_price = serializers.DecimalField(
        coerce_to_string=False, max_digits=6, decimal_places=2, source='regular_price'
    )
    uuid = serializers.UUIDField(required=False, allow_null=True)
    category_uuid = serializers.UUIDField(source='category.uuid')
    category_name = serializers.CharField(source='category.name', read_only=True)

    def create(self, validated_data):
        stylist = self.context['stylist']
        uuid = validated_data.pop('uuid', None)
        if uuid:
            instance = stylist.services.filter(uuid=uuid).first()
        else:
            instance = None
        return self.update(instance, validated_data)

    def update(self, instance, validated_data):
        stylist = self.context['stylist']
        data_to_save = validated_data.copy()
        data_to_save.update({'stylist': stylist})
        category_data = data_to_save.pop('category', {})
        category_uuid = category_data.get('uuid', None)
        category = get_object_or_404(ServiceCategory, uuid=category_uuid)

        # check if date from client actually matches a service template
        # if it does not - generate service origin uuid from scratch, otherwise
        # assign from template

        service_templates = ServiceTemplate.objects.filter(
            name=data_to_save['name'],
            regular_price=data_to_save['regular_price'],
            category=category,
        )

        service_origin_uuid = uuid.uuid4()
        if instance:
            if service_templates.filter(uuid=instance.service_origin_uuid).exists():
                service_origin_uuid = instance.service_origin_uuid
        else:
            instance = StylistService(stylist=stylist)
            if service_templates.exists():
                service_origin_uuid = service_templates.last().uuid

        data_to_save.update({'category': category, 'service_origin_uuid': service_origin_uuid})

        return super(StylistServiceSerializer, self).update(instance, data_to_save)

    class Meta:
        model = StylistService
        fields = [
            'name', 'description', 'base_price', 'duration_minutes',
            'is_enabled', 'photo_samples', 'category_uuid', 'category_name',
            'uuid'
        ]


class StylistSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    salon_name = serializers.CharField(
        source='salon.name', allow_null=True, required=False
    )
    salon_address = serializers.CharField(source='salon.address', allow_null=True)

    # TODO: Enable address sub-fields as soon as we have proper address splitting mechanics

    # salon_city = serializers.CharField(source='salon.city', required=False)
    # salon_zipcode = serializers.CharField(source='salon.zip_code', required=False)
    # salon_state = serializers.CharField(source='salon.state', required=False)

    profile_photo_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    profile_photo_url = serializers.CharField(read_only=True, source='get_profile_photo_url')

    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    phone = serializers.CharField(source='user.phone',)

    class Meta:
        model = Stylist
        fields = [
            'id', 'first_name', 'last_name', 'phone', 'profile_photo_url',
            'salon_name', 'salon_address', 'profile_photo_id',
        ]

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
        coerce_to_string=False, max_digits=6, decimal_places=2, source='regular_price')

    class Meta:
        model = ServiceTemplate
        fields = ['name', 'description', 'base_price', 'duration_minutes', ]


class ServiceTemplateSetListSerializer(serializers.ModelSerializer):
    image_url = serializers.CharField(read_only=True, source='get_image_url')

    class Meta:
        model = ServiceTemplateSet
        fields = ['uuid', 'name', 'description', 'image_url', ]

    def get_services(self, template_set: ServiceTemplateSet):
        templates = template_set.templates.all()[:MAX_SERVICE_TEMPLATE_PREVIEW_COUNT]
        return ServiceTemplateSerializer(templates, many=True).data


class ServiceTemplateCategoryDetailsSerializer(serializers.ModelSerializer):

    services = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCategory
        fields = ['name', 'uuid', 'services']

    def get_services(self, service_category: ServiceCategory):
        templates = service_category.templates.order_by('-regular_price')
        if 'service_template_set' in self.context:
            templates = templates.filter(templateset=self.context['service_template_set'])
        return ServiceTemplateDetailsSerializer(templates, many=True).data


class StylistServiceCategoryDetailsSerializer(serializers.ModelSerializer):

    services = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCategory
        fields = ['name', 'uuid', 'services']

    def get_services(self, service_category: ServiceCategory):
        stylist: Stylist = self.context['stylist']
        services = stylist.services.filter(category=service_category).order_by('-regular_price')
        return StylistServiceSerializer(services, many=True).data


class ServiceTemplateSetDetailsSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()
    image_url = serializers.CharField(read_only=True, source='get_image_url')
    service_time_gap_minutes = serializers.SerializerMethodField()

    class Meta:
        model = ServiceTemplateSet
        fields = [
            'uuid', 'name', 'description', 'categories', 'image_url', 'service_time_gap_minutes',
        ]

    def get_categories(self, service_template_set: ServiceTemplateSet):
        category_queryset = ServiceCategory.objects.all().order_by(
            'name', 'uuid'
        ).distinct('name', 'uuid')
        return ServiceTemplateCategoryDetailsSerializer(
            category_queryset,
            context={'service_template_set': service_template_set},
            many=True
        ).data

    def get_service_time_gap_minutes(self, instance):
        stylist: Stylist = self.context['stylist']
        return DurationMinuteField().to_representation(
            stylist.service_time_gap
        )


class StylistServiceListSerializer(serializers.ModelSerializer):
    """Serves for convenience of packing services under dictionary key"""
    services = StylistServiceSerializer(many=True, write_only=True, required=False)
    categories = serializers.SerializerMethodField(read_only=True)
    service_time_gap_minutes = DurationMinuteField(source='service_time_gap')

    class Meta:
        fields = ['services', 'service_time_gap_minutes', 'categories', ]
        model = Stylist

    def get_categories(self, stylist: Stylist):
        category_queryset = ServiceCategory.objects.all().order_by(
            'name', 'uuid'
        ).distinct('name', 'uuid')
        return StylistServiceCategoryDetailsSerializer(
            category_queryset,
            context={'stylist': stylist},
            many=True
        ).data

    def update(self, instance: Stylist, validated_data: Dict):
        services = self.initial_data.pop('services')
        validated_data.pop('services', [])
        with transaction.atomic():
            for service_item in services:
                service_object = None
                uuid = service_item.pop('uuid', None)
                if uuid:
                    service_object = instance.services.filter(uuid=uuid).last()
                if not uuid or not service_object:
                    service_object = StylistService(stylist=instance)
                service_serializer = StylistServiceSerializer(
                    instance=service_object, data=service_item, context={'stylist': instance})
                service_serializer.is_valid(raise_exception=True)
                service_serializer.save()
            return super(StylistServiceListSerializer, self).update(instance, validated_data)


class StylistProfileStatusSerializer(serializers.ModelSerializer):
    has_personal_data = serializers.SerializerMethodField()
    has_picture_set = serializers.SerializerMethodField()
    has_services_set = serializers.SerializerMethodField()
    has_business_hours_set = serializers.SerializerMethodField()
    has_weekday_discounts_set = serializers.SerializerMethodField()
    has_other_discounts_set = serializers.SerializerMethodField()

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
        return stylist.is_discount_configured

    def get_has_other_discounts_set(self, stylist: Stylist) -> bool:
        return stylist.is_discount_configured


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


class StylistAvailableWeekDayWithBookedTimeSerializer(serializers.ModelSerializer):
    weekday_iso = serializers.IntegerField(source='weekday')
    booked_time_minutes = serializers.SerializerMethodField()
    booked_appointments_count = serializers.SerializerMethodField()

    class Meta:
        model = StylistAvailableWeekDay
        fields = [
            'weekday_iso', 'work_start_at', 'work_end_at', 'is_available', 'booked_time_minutes',
            'booked_appointments_count',
        ]

    def get_booked_time_minutes(self, weekday: StylistAvailableWeekDay) -> int:
        """Return duration of appointments on this weekday during current week"""
        stylist: Stylist = weekday.stylist
        service_gap_minutes: int = int(stylist.service_time_gap.total_seconds() / 60)
        # ExtractWeekDay returns non-iso weekday, e.g. Sunday == 1, so need to cast
        current_non_iso_week_day = (weekday.weekday % 7) + 1
        total_day_duration: int = stylist.get_current_week_appointments(
            include_cancelled=False
        ).annotate(
            weekday=ExtractWeekDay('datetime_start_at')
        ).filter(
            weekday=current_non_iso_week_day
        ).count() * service_gap_minutes

        return total_day_duration

    def get_booked_appointments_count(self, weekday: StylistAvailableWeekDay) -> int:
        stylist: Stylist = weekday.stylist
        # ExtractWeekDay returns non-iso weekday, e.g. Sunday == 1, so need to cast
        current_non_iso_week_day = (weekday.weekday % 7) + 1
        return stylist.get_current_week_appointments(
            include_cancelled=False
        ).annotate(
            weekday=ExtractWeekDay('datetime_start_at')
        ).filter(
            weekday=current_non_iso_week_day
        ).count()


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
            stylist.is_discount_configured = True
            return super(StylistDiscountsSerializer, self).update(stylist, validated_data)

    class Meta:
        model = Stylist
        fields = [
            'weekdays', 'first_booking', 'rebook_within_1_week', 'rebook_within_2_weeks',
        ]


class AppointmentValidationMixin(object):

    def validate_datetime_start_at(self, datetime_start_at: datetime.datetime):
        context: Dict = getattr(self, 'context', {})
        if context.get('force_start', False):
            return datetime_start_at

        stylist: Stylist = context['stylist']
        # check if appointment start is in the past
        if datetime_start_at < stylist.get_current_now():
            raise serializers.ValidationError(
                appointment_errors.ERR_APPOINTMENT_IN_THE_PAST
            )
        # check if appointment doesn't fit working hours

        if not stylist.is_working_time(datetime_start_at):
            raise serializers.ValidationError(
                appointment_errors.ERR_APPOINTMENT_OUTSIDE_WORKING_HOURS
            )
        # check if there are intersecting appointments
        if stylist.get_appointments_in_datetime_range(
            datetime_start_at, datetime_start_at + stylist.service_time_gap,
            including_to=True
        ).exists():
            raise serializers.ValidationError(
                appointment_errors.ERR_APPOINTMENT_INTERSECTION
            )
        return datetime_start_at

    def validate_service_uuid(self, service_uuid: str):
        context: Dict = getattr(self, 'context', {})
        stylist: Stylist = context['stylist']
        if not stylist.services.filter(
            uuid=service_uuid
        ).exists():
            raise serializers.ValidationError(
                appointment_errors.ERR_SERVICE_DOES_NOT_EXIST
            )
        return service_uuid

    def validate_services(self, services):
        if len(services) == 0:
            raise serializers.ValidationError(
                appointment_errors.ERR_SERVICE_REQUIRED
            )
        for service in services:
            self.validate_service_uuid(
                str(service['service_uuid'])
            )
        return services

    def validate_client_uuid(self, client_uuid: Optional[str]):
        context: Dict = getattr(self, 'context', {})
        stylist: Stylist = context['stylist']

        if client_uuid:
            if not ClientOfStylist.objects.filter(
                    uuid=client_uuid,
                    appointments__stylist=stylist,
            ).exists():
                raise serializers.ValidationError(
                    appointment_errors.ERR_CLIENT_DOES_NOT_EXIST
                )
        return client_uuid


class AppointmentServiceSerializer(serializers.ModelSerializer):
    uuid = serializers.UUIDField(read_only=True)
    service_name = serializers.CharField(read_only=True)
    regular_price = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True
    )
    client_price = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, required=False
    )

    class Meta:
        model = AppointmentService
        fields = [
            'uuid', 'service_name', 'service_uuid', 'client_price', 'regular_price',
            'is_original',
        ]


class AppointmentSerializer(AppointmentValidationMixin, serializers.ModelSerializer):
    uuid = serializers.UUIDField(read_only=True)

    client_uuid = serializers.UUIDField(source='client.uuid', allow_null=True, required=False)
    client_first_name = serializers.CharField(
        allow_null=True, allow_blank=True, required=False
    )
    client_last_name = serializers.CharField(
        allow_null=True, allow_blank=True, required=False
    )
    client_phone = serializers.CharField(required=False,)

    total_client_price_before_tax = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True
    )
    total_tax = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True
    )
    total_card_fee = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True
    )

    grand_total = serializers.DecimalField(
        max_digits=4, decimal_places=0, coerce_to_string=False, read_only=True
    )

    has_tax_included = serializers.NullBooleanField(read_only=True)
    has_card_fee_included = serializers.NullBooleanField(read_only=True)

    services = AppointmentServiceSerializer(many=True)

    datetime_start_at = serializers.DateTimeField()
    duration_minutes = DurationMinuteField(source='duration', read_only=True)

    # status will be read-only in this serializer, to avoid arbitrary setting
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'uuid', 'client_uuid', 'client_first_name', 'client_last_name',
            'client_phone', 'datetime_start_at', 'duration_minutes', 'status',
            'total_tax', 'total_card_fee', 'total_client_price_before_tax',
            'services', 'grand_total', 'has_tax_included', 'has_card_fee_included',
        ]

    def validate(self, attrs):
        errors = {}
        if 'client_uuid' not in self.initial_data:
            for field in ['client_first_name', 'client_last_name', 'client_phone']:
                if field not in self.initial_data:
                    errors.update({
                        field: serializers.Field.default_error_messages['required']
                    })
            if ClientOfStylist.objects.filter(
                    phone=attrs['client_phone'],
                    stylist=self.context['stylist']).exists():
                errors.update({
                    'client_phone': ErrorMessages.UNIQUE_CLIENT_PHONE
                })
            if ClientOfStylist.objects.filter(
                    first_name=attrs['client_first_name'],
                    last_name=attrs['client_last_name'],
                    stylist=self.context['stylist']).exists():
                errors.update({
                    'client_first_name': ErrorMessages.UNIQUE_CLIENT_NAME
                })
            if errors:
                raise serializers.ValidationError(errors)
        return super(AppointmentSerializer, self).validate(attrs)

    def create(self, validated_data):
        data = validated_data.copy()
        stylist: Stylist = self.context['stylist']

        client: Optional[ClientOfStylist] = None
        client_data = validated_data.pop('client', {})
        client_uuid = client_data.get('uuid', None)

        if client_uuid:
            client: ClientOfStylist = ClientOfStylist.objects.get(uuid=client_uuid)

        data['created_by'] = stylist.user
        data['stylist'] = stylist

        datetime_start_at: datetime.datetime = data['datetime_start_at']

        # create first AppointmentService
        with transaction.atomic():
            if not client:
                client = ClientOfStylist.objects.create(
                    first_name=data['client_first_name'],
                    last_name=data['client_last_name'],
                    phone=data.pop('client_phone'),
                    stylist=stylist
                )
            data['client_last_name'] = client.last_name
            data['client_first_name'] = client.first_name
            data['client'] = client

            appointment_services = data.pop('services', [])

            # pre-calculate client services before adding the appointment; otherwise
            # appointment presence will affect the price calculation

            services_with_client_prices: List[Tuple[StylistService, CalculatedPrice]] = []
            for appointment_service in appointment_services:
                service: StylistService = stylist.services.get(
                    uuid=appointment_service['service_uuid']
                )
                client_price: CalculatedPrice = calculate_price_and_discount_for_client_on_date(
                    service=service, client=client, date=datetime_start_at.date()
                )
                services_with_client_prices.append((service, client_price))

            appointment: Appointment = super(AppointmentSerializer, self).create(data)
            total_client_price_before_tax: Decimal = 0
            for (service, client_price) in services_with_client_prices:
                AppointmentService.objects.create(
                    appointment=appointment,
                    service_name=service.name,
                    service_uuid=service.uuid,
                    duration=service.duration,
                    regular_price=service.regular_price,
                    client_price=client_price.price,
                    calculated_price=client_price.price,
                    applied_discount=(
                        client_price.applied_discount.value
                        if client_price.applied_discount else None
                    ),
                    discount_percentage=client_price.discount_percentage,
                    is_price_edited=False,
                    is_original=True
                )
                total_client_price_before_tax += Decimal(client_price.price)

            # set initial price settings
            appointment_prices: AppointmentPrices = calculate_appointment_prices(
                price_before_tax=total_client_price_before_tax,
                include_card_fee=False, include_tax=False
            )
            for k, v in appointment_prices._asdict().items():
                setattr(appointment, k, v)
            appointment.save()
            appointment.append_status_history(updated_by=stylist.user)

        return appointment


class AppointmentPreviewSerializer(serializers.ModelSerializer):
    datetime_end_at = serializers.SerializerMethodField()
    duration_minutes = DurationMinuteField(source='duration', read_only=True)
    services = AppointmentServiceSerializer(many=True)

    class Meta:
        model = Appointment
        fields = [
            'uuid', 'client_first_name', 'client_last_name', 'datetime_start_at',
            'datetime_end_at', 'duration_minutes', 'services',
        ]

    def get_datetime_end_at(self, appointment: Appointment):
        datetime_end_at = appointment.datetime_start_at + appointment.duration
        return serializers.DateTimeField().to_representation(datetime_end_at)


class AppointmentPreviewRequestSerializer(AppointmentValidationMixin, serializers.Serializer):
    client_uuid = serializers.UUIDField(
        allow_null=True, required=False
    )
    services = AppointmentServiceSerializer(many=True, required=True)
    datetime_start_at = serializers.DateTimeField()
    has_tax_included = serializers.BooleanField()
    has_card_fee_included = serializers.BooleanField()
    appointment_uuid = serializers.UUIDField(required=False, allow_null=True)

    def validate_appointment_uuid(
            self, appointment_uuid: Optional[uuid.UUID]
    ) -> Optional[uuid.UUID]:
        if appointment_uuid is not None:
            stylist: Stylist = self.context['stylist']
            if not stylist.appointments.filter(uuid=appointment_uuid).exists():
                raise serializers.ValidationError(
                    appointment_errors.ERR_APPOINTMENT_DOESNT_EXIST
                )
        return appointment_uuid


class AppointmentPreviewResponseSerializer(serializers.Serializer):
    regular_price = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True,
    )
    client_price = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True
    )
    duration_minutes = DurationMinuteField(source='duration', read_only=True)
    conflicts_with = AppointmentPreviewSerializer(many=True)
    grand_total = serializers.DecimalField(
        max_digits=4, decimal_places=0, coerce_to_string=False, read_only=True
    )
    total_client_price_before_tax = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True
    )
    total_tax = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True
    )
    total_card_fee = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, read_only=True
    )
    has_tax_included = serializers.BooleanField(read_only=True)
    has_card_fee_included = serializers.BooleanField(read_only=True)
    services = AppointmentServiceSerializer(many=True)


class AppointmentUpdateSerializer(
    AppointmentValidationMixin, serializers.ModelSerializer
):

    services = AppointmentServiceSerializer(many=True, required=False)
    has_tax_included = serializers.NullBooleanField(required=False)
    has_card_fee_included = serializers.NullBooleanField(required=False)

    class Meta:
        model = Appointment
        fields = ['status', 'services', 'has_tax_included', 'has_card_fee_included', ]

    def validate(self, attrs):
        status = self.initial_data['status']
        if status == AppointmentStatus.CHECKED_OUT:
            if self.instance and self.instance.status == AppointmentStatus.CHECKED_OUT:
                raise serializers.ValidationError({
                    'status': appointment_errors.ERR_NO_SECOND_CHECKOUT
                })
            if 'services' not in self.initial_data:
                raise serializers.ValidationError({
                    'services': appointment_errors.ERR_SERVICE_REQUIRED
                })
            if 'has_tax_included' not in self.initial_data:
                raise serializers.ValidationError({
                    'has_tax_included':
                        serializers.Field.default_error_messages['required']
                })
            if 'has_card_fee_included' not in self.initial_data:
                raise serializers.ValidationError({
                    'has_card_fee_included':
                        serializers.Field.default_error_messages['required']
                })
        return attrs

    def validate_services(self, services):
        status = self.initial_data['status']
        if status == AppointmentStatus.CHECKED_OUT:
            services = self.initial_data.get('services', [])
            if len(services) == 0:
                raise serializers.ValidationError(appointment_errors.ERR_SERVICE_REQUIRED)
            for service in services:
                self.validate_service_uuid(
                    str(service['service_uuid'])
                )
        return services

    def validate_status(self, status: AppointmentStatus) -> AppointmentStatus:
        if status not in APPOINTMENT_STYLIST_SETTABLE_STATUSES:
            raise serializers.ValidationError(
                appointment_errors.ERR_STATUS_NOT_ALLOWED
            )
        return status

    @staticmethod
    @transaction.atomic
    def _update_appointment_services(
            appointment: Appointment, service_records: List[Dict]
    ) -> None:
        """Replace existing appointment services preserving added on appointment creation"""
        stylist_services = appointment.stylist.services
        services_to_keep: List[uuid.UUID] = [
            service_record['service_uuid'] for service_record in service_records
        ]
        # Delete services which may have been added during appointment creation,
        # but are removed during the checkout. E.g. client had decided to change the
        # service.
        appointment.services.all().exclude(service_uuid__in=services_to_keep).delete()

        # Add new services supplied during the checkout. These are new services, so
        # no discounts will be applied (discount applies only during appointment's
        # initial creation

        for service_record in service_records:
            service_uuid: uuid.UUID = service_record['service_uuid']
            service_client_price: Optional[Decimal] = (
                service_record['client_price'] if 'client_price' in service_record else None)
            try:
                appointment_service: AppointmentService = (
                    appointment.services.get(service_uuid=service_uuid))
                # service already exists, so we will not re-write it
                if service_client_price:
                    appointment_service.set_client_price(service_client_price)
                continue
            except AppointmentService.DoesNotExist:
                service: StylistService = stylist_services.get(uuid=service_uuid)
                AppointmentService.objects.create(
                    appointment=appointment,
                    service_uuid=service.uuid,
                    service_name=service.name,
                    duration=service.duration,
                    regular_price=service.regular_price,
                    calculated_price=service.regular_price,
                    client_price=service_client_price if service_client_price
                    else service.regular_price,
                    is_price_edited=True if service_client_price else False,
                    applied_discount=None,
                    is_original=False
                )

    def save(self, **kwargs):

        status = self.validated_data['status']
        user: User = self.context['user']
        appointment: Appointment = self.instance
        with transaction.atomic():
            if status == AppointmentStatus.CHECKED_OUT:
                self._update_appointment_services(
                    appointment, self.validated_data['services']
                )
                total_client_price_before_tax: Decimal = appointment.services.aggregate(
                    total_before_tax=Coalesce(Sum('client_price'), 0)
                )['total_before_tax']

                # update final prices and save appointment

                appointment_prices: AppointmentPrices = calculate_appointment_prices(
                    price_before_tax=total_client_price_before_tax,
                    include_card_fee=self.validated_data['has_card_fee_included'],
                    include_tax=self.validated_data['has_tax_included']
                )

                for k, v in appointment_prices._asdict().items():
                    setattr(appointment, k, v)

            if appointment.status != status:
                appointment.status = status
                appointment.append_status_history(updated_by=user)

            appointment.save(**kwargs)

        return appointment


class StylistTodaySerializer(serializers.ModelSerializer):
    stylist_first_name = serializers.CharField(
        read_only=True, source='user.first_name', allow_null=True
    )
    stylist_last_name = serializers.CharField(
        read_only=True, source='user.last_name', allow_null=True
    )
    stylist_profile_photo_url = serializers.CharField(
        read_only=True, source='get_profile_photo_url',
    )
    today_appointments = serializers.SerializerMethodField()
    today_visits_count = serializers.SerializerMethodField()
    week_visits_count = serializers.SerializerMethodField()
    past_visits_count = serializers.SerializerMethodField()

    class Meta:
        model = Stylist
        fields = [
            'today_appointments', 'today_visits_count', 'week_visits_count', 'past_visits_count',
            'stylist_first_name', 'stylist_last_name', 'stylist_profile_photo_url',
        ]

    def get_today_appointments(self, stylist: Stylist):
        """Return today's appointments that are still meaningful for the stylist"""
        next_appointments = stylist.get_today_appointments(
            upcoming_only=False,
            include_cancelled=True,
            include_checked_out=False
        ).exclude(
            status__in=[
                AppointmentStatus.CANCELLED_BY_STYLIST,
                AppointmentStatus.NO_SHOW,
            ]
        )
        return AppointmentSerializer(
            next_appointments, many=True
        ).data

    def get_today_visits_count(self, stylist: Stylist):
        """Return non-cancelled appointments till end of today"""
        return stylist.get_today_appointments(
            upcoming_only=True,
            include_cancelled=False,
            include_checked_out=False
        ).count()

    def get_week_visits_count(self, stylist: Stylist):
        """Return non-cancelled appointments till end of week"""
        week_start, week_end = stylist.get_current_week_bounds()
        return stylist.get_appointments_in_datetime_range(
            datetime_from=stylist.get_current_now(),
            datetime_to=week_end,
            include_cancelled=False,
            include_checked_out=False
        ).count()

    def get_past_visits_count(self, stylist: Stylist):
        return stylist.get_appointments_in_datetime_range(
            datetime_from=None,
            datetime_to=stylist.get_current_now(),
            include_cancelled=False
        ).exclude(
            datetime_start_at__gt=stylist.get_current_now() - stylist.service_time_gap
        ).count()


class InvitationSerializer(serializers.ModelSerializer):

    phone = serializers.CharField(required=True)

    class Meta:
        model = Invitation
        fields = ['phone', ]


class StylistSettingsRetrieveSerializer(serializers.ModelSerializer):
    profile = StylistSerializer(source='*')
    services_count = serializers.IntegerField(source='services.count')
    services = serializers.SerializerMethodField()
    worktime = StylistAvailableWeekDayWithBookedTimeSerializer(
        source='available_days', many=True
    )
    total_week_booked_minutes = serializers.SerializerMethodField()
    total_week_appointments_count = serializers.SerializerMethodField()

    class Meta:
        model = Stylist
        fields = [
            'profile', 'services_count', 'services', 'worktime', 'total_week_booked_minutes',
            'total_week_appointments_count',
        ]

    def get_services(self, stylist: Stylist):
        return StylistServiceSerializer(
            stylist.services.all()[:3], many=True
        ).data

    def get_total_week_booked_minutes(self, stylist: Stylist) -> int:
        service_gap_minutes: int = int(stylist.service_time_gap.total_seconds() / 60)
        total_week_duration: int = stylist.get_current_week_appointments(
            include_cancelled=False
        ).count() * service_gap_minutes

        return total_week_duration

    def get_total_week_appointments_count(self, stylist: Stylist) -> int:
        return stylist.get_current_week_appointments(
            include_cancelled=False
        ).count()


class ClientSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)

    class Meta:
        model = ClientOfStylist
        fields = ['uuid', 'first_name', 'last_name', 'phone', ]


class StylistServicePriceSerializer(serializers.Serializer):
    date = serializers.DateField()
    price = serializers.IntegerField()


class StylistServicePricingRequestSerializer(
    AppointmentValidationMixin, serializers.Serializer
):
    service_uuid = serializers.UUIDField()
    client_uuid = serializers.UUIDField(required=False, allow_null=True)


class StylistServicePricingSerializer(serializers.ModelSerializer):
    service_uuid = serializers.UUIDField(source='uuid', read_only=True)
    service_name = serializers.UUIDField(source='name', read_only=True)
    prices = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StylistService
        fields = ['service_uuid', 'service_name', 'prices', ]

    def get_prices(self, stylist_service):
        client = self.context.get('client', None)
        prices_and_dates = generate_prices_for_stylist_service(
            stylist_service, client, exclude_fully_booked=True
        )
        return StylistServicePriceSerializer(
            map(lambda m: {'date': m[0], 'price': trunc(m[1].price)}, prices_and_dates),
            many=True
        ).data
