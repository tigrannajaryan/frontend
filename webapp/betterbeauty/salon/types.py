import datetime
from enum import Enum
from typing import NamedTuple

from pricing import CalculatedPrice


class InvitationStatus(str, Enum):
    UNSENT = 'unsent'
    DELIVERED = 'delivered'
    UNDELIVERED = 'undelivered'
    ACCEPTED = 'accepted'


class DemandOnDate(NamedTuple):
    demand: float
    is_fully_booked: bool
    is_working_day: bool


class PriceOnDate(NamedTuple):
    date: datetime.date
    calculated_price: CalculatedPrice
    is_fully_booked: bool
    is_working_day: bool
