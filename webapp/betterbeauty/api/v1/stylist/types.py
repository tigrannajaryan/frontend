import datetime
from decimal import Decimal

from typing import Dict, List, NamedTuple, Optional
from uuid import UUID

from django.db.models import QuerySet


class AppointmentPreviewRequest(NamedTuple):
    services: List[Dict]
    datetime_start_at: datetime.datetime
    client_uuid: Optional[UUID] = None


class AppointmentPreviewResponse(NamedTuple):
    total_client_price_before_tax: Decimal
    total_tax: Decimal
    total_card_fee: Decimal
    duration: datetime.timedelta
    conflicts_with: QuerySet
