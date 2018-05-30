import datetime
from decimal import Decimal

from typing import NamedTuple, Optional
from uuid import UUID

from django.db.models import QuerySet


class AppointmentPreviewRequest(NamedTuple):
    service_uuid: UUID
    datetime_start_at: datetime.datetime
    client_uuid: Optional[UUID] = None


class AppointmentPreviewResponse(NamedTuple):
    regular_price: Decimal
    client_price: Decimal
    duration: datetime.timedelta
    conflicts_with: QuerySet
