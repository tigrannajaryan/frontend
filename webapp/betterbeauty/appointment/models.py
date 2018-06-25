import datetime
from decimal import Decimal

from uuid import uuid4

from django.db import models, transaction
from django.db.models import Sum
from django.db.models.functions import Coalesce

from client.models import ClientOfStylist
from core.models import User
from pricing import DISCOUNT_TYPE_CHOICES
from salon.models import Stylist

from .choices import APPOINTMENT_STATUS_CHOICES
from .types import AppointmentStatus


class AppointmentManager(models.Manager):

    def get_queryset(self, *args, **kwargs):
        return super(AppointmentManager, self).get_queryset(*args, **kwargs).filter(
            deleted_at__isnull=True
        )


class AppointmentAllObjectsManager(models.Manager):
    use_in_migrations = True


class Appointment(models.Model):
    uuid = models.UUIDField(unique=True, default=uuid4, editable=False)
    stylist = models.ForeignKey(
        Stylist, related_name='appointments', on_delete=models.CASCADE
    )

    # client can be null in case if stylist adds an appointment for someone not in the system
    client = models.ForeignKey(
        ClientOfStylist, related_name='appointments', null=True, on_delete=models.PROTECT
    )
    client_first_name = models.CharField(max_length=255, null=True, blank=True)
    client_last_name = models.CharField(max_length=255, null=True, blank=True)

    datetime_start_at = models.DateTimeField()

    status = models.CharField(
        max_length=30, choices=APPOINTMENT_STATUS_CHOICES, default=AppointmentStatus.NEW)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='created_appointments'
    )

    deleted_at = models.DateTimeField(null=True, default=None)
    deleted_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='deleted_appointments', null=True,
        default=None
    )

    # fields filled on checkout, all null by default
    total_client_price_before_tax = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    total_tax = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    total_card_fee = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    grand_total = models.DecimalField(max_digits=4, decimal_places=0, null=True)
    has_tax_included = models.NullBooleanField(null=True, default=None)
    has_card_fee_included = models.NullBooleanField(null=True, default=None)

    objects = AppointmentManager()
    all_objects = AppointmentAllObjectsManager()

    class Meta:
        db_table = 'appointment'

    def __str__(self):
        return '{0}: {1} - {2}'.format(
            self.datetime_start_at,
            self.get_client_full_name(),
            self.stylist.get_full_name()
        )

    def get_client_full_name(self):
        if self.client:
            return self.client.get_full_name()
        return '{0} {1}'.format(
            self.client_first_name, self.client_last_name
        )

    @transaction.atomic
    def set_status(self, status: AppointmentStatus, updated_by: User):
            self.status = status
            self.save(update_fields=['status', ])
            self.append_status_history(updated_by=updated_by)

    def append_status_history(self, updated_by: User):
        current_now = self.stylist.get_current_now()
        AppointmentStatusHistory.objects.create(appointment=self,
                                                status=self.status,
                                                updated_at=current_now,
                                                updated_by=updated_by)

    @property
    def duration(self) -> datetime.timedelta:
        return self.services.all().aggregate(
            total_duration=Coalesce(Sum('duration'), datetime.timedelta(0))
        )['total_duration']


class AppointmentStatusHistory(models.Model):
    appointment = models.ForeignKey(Appointment, related_name='status_history',
                                    on_delete=models.CASCADE)
    status = models.CharField(max_length=30, choices=APPOINTMENT_STATUS_CHOICES,
                              default=AppointmentStatus.NEW)
    updated_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.ForeignKey(User, related_name='appointment_updates',
                                   on_delete=models.PROTECT)

    class Meta:
        db_table = 'appointment_status_history'


class AppointmentService(models.Model):
    appointment = models.ForeignKey(Appointment, related_name='services', on_delete=models.CASCADE)
    uuid = models.UUIDField(unique=True, default=uuid4, editable=False)

    service_uuid = models.UUIDField()
    service_name = models.CharField(max_length=255)

    regular_price = models.DecimalField(max_digits=6, decimal_places=2)
    calculated_price = models.DecimalField(max_digits=6, decimal_places=2)
    client_price = models.DecimalField(max_digits=6, decimal_places=2)

    applied_discount = models.PositiveIntegerField(choices=DISCOUNT_TYPE_CHOICES, null=True)
    is_price_edited = models.BooleanField(default=False)
    discount_percentage = models.PositiveIntegerField(default=0)

    duration = models.DurationField()

    is_original = models.BooleanField(
        verbose_name='Service with which appointment was created'
    )

    class Meta:
        db_table = 'appointment_service'

    def set_client_price(self, client_price: Decimal):
        self.client_price = client_price
        self.is_price_edited = True
        self.save(update_fields=['client_price', 'is_price_edited'])
