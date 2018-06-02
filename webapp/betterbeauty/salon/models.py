import datetime
import uuid

from decimal import Decimal
from typing import Optional, Tuple

from django.conf import settings
from django.contrib.postgres.fields import DateRangeField
from django.core.validators import MaxValueValidator
from django.db import models
from django.db.models import F, Sum
from django.db.models.functions import Coalesce

from timezone_field import TimeZoneField

from appointment.types import AppointmentStatus
from client.models import Client
from core.choices import WEEKDAY
from core.models import User
from core.types import Weekday

from .choices import INVITATION_STATUS_CHOICES
from .types import InvitationStatus


class StylistServiceManager(models.Manager):
    def get_queryset(self, *args, **kwargs):
        return super(StylistServiceManager, self).get_queryset(*args, **kwargs).filter(
            deleted_at__isnull=True
        )


class StylistServiceWithDeletedManager(models.Manager):
    use_in_migrations = True


class Salon(models.Model):
    name = models.CharField(max_length=255)
    timezone = TimeZoneField(default=settings.TIME_ZONE)
    address = models.CharField(max_length=255)
    # TODO: Remove null/blank on address sub-fields as soon as we have
    # TODO: proper address splitting mechanics in place.
    city = models.CharField(max_length=64, null=True, blank=True)
    state = models.CharField(max_length=2, null=True, blank=True)
    zip_code = models.CharField(max_length=5, null=True, blank=True)
    latitude = models.DecimalField(decimal_places=8, max_digits=10, null=True, blank=True)
    longitude = models.DecimalField(decimal_places=8, max_digits=11, null=True, blank=True)

    class Meta:
        db_table = 'salon'

    def __str__(self) -> str:
        return '{0} ({1})'.format(self.name, self.get_full_address())

    def get_full_address(self) -> str:
        # TODO: change this to proper address generation
        return self.address


class StylistAvailableWeekDay(models.Model):
    stylist = models.ForeignKey(
        'salon.Stylist', on_delete=models.CASCADE, related_name='available_days'
    )
    weekday = models.PositiveSmallIntegerField(choices=WEEKDAY)
    work_start_at = models.TimeField(null=True)
    work_end_at = models.TimeField(null=True)
    is_available = models.BooleanField(default=False)

    class Meta:
        db_table = 'stylist_available_day'
        unique_together = ('stylist', 'weekday', )

    def __str__(self):
        availability_str = ' not'
        availability_time = ''
        if self.is_available:
            availability_str = ''
            availability_time = ' {0} - {1}'.format(
                self.work_start_at,
                self.work_end_at
            )
        return '{0}:{1} available on {2}{3}'.format(
            self.stylist, availability_str, self.get_weekday_display(),
            availability_time
        )


class StylistWeekdayDiscount(models.Model):
    stylist = models.ForeignKey(
        'Stylist', on_delete=models.CASCADE, related_name='weekday_discounts')
    weekday = models.PositiveSmallIntegerField(choices=WEEKDAY)
    discount_percent = models.PositiveIntegerField(validators=[MaxValueValidator(100)])

    class Meta:
        db_table = 'stylist_weekday_discount'
        unique_together = ('stylist', 'weekday', )


class Stylist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    salon = models.ForeignKey(Salon, on_delete=models.PROTECT, null=True)

    rebook_within_1_week_discount_percent = models.PositiveIntegerField(
        default=0, validators=[MaxValueValidator(100)]
    )
    rebook_within_2_weeks_discount_percent = models.PositiveIntegerField(
        default=0, validators=[MaxValueValidator(100)]
    )
    first_time_book_discount_percent = models.PositiveIntegerField(
        default=0, validators=[MaxValueValidator(100)]
    )

    class Meta:
        db_table = 'stylist'

    def __str__(self) -> str:
        return 'Stylist: {0}'.format(self.user)

    @property
    def phone(self) -> Optional[str]:
        return self.user.phone

    @property
    def first_name(self) -> Optional[str]:
        return self.user.first_name

    @property
    def last_name(self) -> Optional[str]:
        return self.user.last_name

    def get_short_name(self) -> str:
        return self.user.get_short_name()

    def get_full_name(self) -> str:
        return self.user.get_full_name()

    def get_profile_photo_url(self) -> Optional[str]:
        if self.user.photo:
            return self.user.photo.url
        return None

    def get_weekday_discount_percent(self, weekday: Weekday) -> int:
        weekday_discount = self.weekday_discounts.filter(
            weekday=weekday
        ).last()
        if weekday_discount:
            return weekday_discount.discount_percent
        return 0

    def get_date_range_discount_percent(self, date: datetime.date) -> int:
        range_discount = self.date_range_discounts.filter(
            dates__contains=date
        ).last()
        if range_discount:
            return range_discount.discount_percent
        return 0

    def get_or_create_weekday_availability(
            self, weekday: Weekday
    ) -> StylistAvailableWeekDay:
        return self.available_days.get_or_create(weekday=weekday)[0]

    def get_or_create_weekday_discount(
            self, weekday: Weekday, discount_percent: int
    ) -> StylistWeekdayDiscount:
        return self.weekday_discounts.get_or_create(
            weekday=weekday, discount_percent=discount_percent
        )[0]

    def get_current_now(self) -> datetime.datetime:
        """Return timezone-aware current datetime in the salon's timezone"""
        return self.salon.timezone.localize(
            datetime.datetime.now()
        )

    def with_salon_tz(self, date_time: datetime.datetime) -> datetime.datetime:
        """Convert supplied timezone-aware datetime to salon's timezone"""
        return date_time.astimezone(self.salon.timezone)

    def get_current_week_bounds(
            self
    ) -> Tuple[datetime.datetime, datetime.datetime]:
        """Return tuple of current week bounds"""
        current_now = self.get_current_now()
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

    def get_appointments_in_datetime_range(
            self,
            datetime_from: Optional[datetime.datetime]=None,
            datetime_to: Optional[datetime.datetime]=None,
            including_to: Optional[bool]=False,
            include_cancelled=False, **kwargs
    ) -> models.QuerySet:
        """
        Return appointments present in given datetime range.
        :param datetime_from: datetime at which first appointment is present
        :param datetime_to: datetime by which last appointment starts
        :param including_to: whether or not end datetime should be inclusive
        :param include_cancelled: whether or not cancelled appointments are included
        :param kwargs: any optional filter kwargs to be applied
        :return: Resulting Appointment queryset
        """
        appointments = self.appointments.filter(
            **kwargs
        ).order_by('datetime_start_at')

        if datetime_from is not None:
            appointments = appointments.annotate(
                services_duration=Coalesce(Sum('services__duration'), datetime.timedelta(0))
            ).filter(
                datetime_start_at__gte=datetime_from - F('services_duration')
            )

        if datetime_to is not None:
            if including_to:
                appointments = appointments.filter(
                    datetime_start_at__lt=datetime_to
                )
            appointments = appointments.filter(
                datetime_start_at__lt=datetime_to
            )

        if not include_cancelled:
            return appointments.exclude(status__in=[
                AppointmentStatus.CANCELLED_BY_CLIENT,
                AppointmentStatus.CANCELLED_BY_STYLIST
            ])
        return appointments

    def get_today_appointments(
            self, upcoming_only=True, include_cancelled=False
    ) -> models.QuerySet:
        """Return today's appointments, aware of stylist's timezone"""
        current_now: datetime.datetime = self.get_current_now()

        datetime_from = current_now.replace(hour=0, minute=0, second=0)
        if upcoming_only is True:
            datetime_from = current_now

        next_midnight = (
            current_now + datetime.timedelta(days=1)
        ).replace(hour=0, minute=0, second=0)

        return self.get_appointments_in_datetime_range(
            datetime_from, next_midnight, include_cancelled=include_cancelled
        )

    def get_current_week_appointments(
            self, include_cancelled=False
    ) -> models.QuerySet:
        """Return appointments in timezone-aware bounds of stylist's current week"""
        week_start, week_end = self.get_current_week_bounds()
        return self.get_appointments_in_datetime_range(
            datetime_from=week_start,
            datetime_to=week_end,
            include_cancelled=include_cancelled
        )

    def is_working_time(
            self, date_time: datetime.datetime, duration: Optional[datetime.timedelta]=None
    ) -> bool:
        if duration is None:
            duration = datetime.timedelta(0)
        # FIXME: There should be extra logic to check if start and end time fall to
        # FIXME: different dates. But I guess it should be an extremely rare case for now.
        date_time = self.with_salon_tz(date_time)
        end_time = (date_time + duration).time()
        return self.available_days.filter(
            weekday=date_time.isoweekday(),
            work_start_at__lte=date_time.time(),
            work_end_at__gt=end_time
        ).exists()


class ServiceCategory(models.Model):
    name = models.CharField(max_length=255, unique=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    class Meta:
        db_table = 'service_category'

    def __str__(self):
        return self.name


class ServiceTemplateSet(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    name = models.CharField(max_length=255, unique=True)
    image = models.ImageField(upload_to='template_set_images', null=True, blank=True)

    description = models.TextField(blank=True)

    class Meta:
        db_table = 'service_template_set'

    def __str__(self):
        return 'Service Template Set: {0}'.format(self.name)

    def get_image_url(self) -> Optional[str]:
        if self.image:
            return self.image.url
        return None


class ServiceTemplate(models.Model):
    """Base service template; StylistService object will be copied from this one"""
    category = models.ForeignKey(
        ServiceCategory, on_delete=models.PROTECT, related_name='templates'
    )

    templateset = models.ForeignKey(
        ServiceTemplateSet, on_delete=models.PROTECT,
        related_name='templates'
    )

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=6, decimal_places=2)
    duration = models.DurationField()

    class Meta:
        db_table = 'service_template'
        # unique_together = ('name', 'templateset',)

    def __str__(self):
        return 'Service template: {0}'.format(self.name)


class StylistService(models.Model):
    stylist = models.ForeignKey(Stylist, on_delete=models.CASCADE, related_name='services')
    category = models.ForeignKey(ServiceCategory, on_delete=models.PROTECT, null=True)
    service_uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=6, decimal_places=2)
    duration = models.DurationField()
    is_enabled = models.BooleanField(default=False)

    deleted_at = models.DateTimeField(null=True, default=None)

    objects = StylistServiceManager()
    all_objects = StylistServiceWithDeletedManager()

    class Meta:
        db_table = 'stylist_service'

    def __str__(self):
        deleted_str = '[DELETED] ' if self.deleted_at else ''
        return '{2}{0} by {1}'.format(self.name, self.stylist, deleted_str)

    def calculate_price_for_client(
            self, datetime_start_at: datetime.datetime, client=None,
    ) -> Decimal:
        # TODO: calculate price based on existing discounts
        return self.base_price


class StylistServicePhotoSample(models.Model):
    stylist_service = models.ForeignKey(
        StylistService, on_delete=models.CASCADE, related_name='photo_samples')
    photo = models.ImageField()

    class Meta:
        db_table = 'stylist_service_photo_sample'


class StylistDateRangeDiscount(models.Model):
    stylist = models.ForeignKey(
        Stylist, on_delete=models.CASCADE, related_name='date_range_discounts')
    discount_percent = models.PositiveIntegerField(validators=[MaxValueValidator(100)])
    dates = DateRangeField()
    # TODO: enforce uniqueness on date range. Django doesn't support it directly

    class Meta:
        db_table = 'stylist_date_range_discount'


class Invitation(models.Model):
    stylist = models.ForeignKey(Stylist, on_delete=models.CASCADE, related_name='invites')
    phone = models.CharField(max_length=15)
    status = models.CharField(
        max_length=15, choices=INVITATION_STATUS_CHOICES, default=InvitationStatus.UNSENT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, default=None)
    accepted_at = models.DateTimeField(null=True, default=None)

    created_client = models.ForeignKey(Client, null=True, default=None, on_delete=models.CASCADE)

    class Meta:
        db_table = 'invitation'
