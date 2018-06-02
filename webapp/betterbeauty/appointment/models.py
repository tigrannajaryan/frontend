import datetime
from decimal import Decimal

from uuid import uuid4

from django.db import models
from django.db.models import Sum
from django.db.models.functions import Coalesce

from client.models import Client
from core.models import User
from core.utils import calculate_card_fee, calculate_tax
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
        Client, related_name='appointments', null=True, on_delete=models.PROTECT
    )
    client_first_name = models.CharField(max_length=255, null=True, blank=True)
    client_last_name = models.CharField(max_length=255, null=True, blank=True)

    service_uuid = models.UUIDField(null=True)
    service_name = models.CharField(max_length=255)

    datetime_start_at = models.DateTimeField()

    status = models.CharField(
        max_length=30, choices=APPOINTMENT_STATUS_CHOICES, default=AppointmentStatus.NEW)
    status_updated_at = models.DateTimeField(null=True, default=None)
    status_updated_by = models.ForeignKey(
        User, null=True, default=None, on_delete=models.PROTECT,
        related_name='updated_appointments'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='created_appointments'
    )

    deleted_at = models.DateTimeField(null=True, default=None)
    deleted_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='deleted_appointments', null=True,
        default=None
    )

    objects = AppointmentManager()
    all_objects = AppointmentAllObjectsManager()

    class Meta:
        db_table = 'appointment'

    def __str__(self):
        return '{0} at {1}: {2} - {3}'.format(
            self.service_name,
            self.datetime_start_at,
            self.get_client_full_name(),
            self.stylist.get_full_name()
        )

    def get_client_full_name(self):
        if self.client:
            return self.client.user.get_full_name()
        return '{0} {1}'.format(
            self.client_first_name, self.client_last_name
        )

    def set_status(self, status: AppointmentStatus, updated_by: User):
        current_now = self.stylist.get_current_now()

        self.status = status
        self.status_updated_by = updated_by
        self.status_updated_at = current_now
        self.save(update_fields=['status', 'status_updated_by', 'status_updated_at', ])

    @property
    def total_client_price_before_tax(self) -> Decimal:
        return self.services.all().aggregate(
            total_sum=Coalesce(Sum('client_price'), Decimal(0))
        )['total_sum']

    @property
    def total_tax(self) -> Decimal:
        return calculate_tax(self.total_client_price_before_tax)

    @property
    def total_card_fee(self) -> Decimal:
        return calculate_card_fee(self.total_client_price_before_tax + self.total_tax)

    @property
    def duration(self) -> datetime.timedelta:
        return self.services.all().aggregate(
            total_duration=Coalesce(Sum('duration'), datetime.timedelta(0))
        )['total_duration']


class AppointmentService(models.Model):
    appointment = models.ForeignKey(Appointment, related_name='services', on_delete=models.CASCADE)
    uuid = models.UUIDField(unique=True, default=uuid4, editable=False)

    service_uuid = models.UUIDField()
    service_name = models.CharField(max_length=255)

    regular_price = models.DecimalField(max_digits=6, decimal_places=2)
    client_price = models.DecimalField(max_digits=6, decimal_places=2)

    duration = models.DurationField()

    is_original = models.BooleanField(
        verbose_name='Service with which appointment was created'
    )

    class Meta:
        db_table = 'appointment_service'
