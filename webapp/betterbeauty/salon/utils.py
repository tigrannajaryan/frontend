from django.db import transaction

from core.constants import (
    DEFAULT_FIRST_TIME_BOOK_DISCOUNT_PERCENT,
    DEFAULT_REBOOK_WITHIN_1_WEEK_DISCOUNT_PERCENT,
    DEFAULT_REBOOK_WITHIN_2_WEEKS_DISCOUNT_PERCENT,
    DEFAULT_WEEKDAY_DISCOUNT_PERCENTS,
)
from core.models import User
from core.types import Weekday
from salon.models import Stylist


def create_stylist_profile_for_user(user: User, **kwargs) -> Stylist:
    with transaction.atomic():
        kwargs.update(
            {
                'rebook_within_1_week_discount_percent':
                    DEFAULT_REBOOK_WITHIN_1_WEEK_DISCOUNT_PERCENT,
                'rebook_within_2_weeks_discount_percent':
                    DEFAULT_REBOOK_WITHIN_2_WEEKS_DISCOUNT_PERCENT,
                'first_time_book_discount_percent':
                    DEFAULT_FIRST_TIME_BOOK_DISCOUNT_PERCENT
            }
        )
        stylist = Stylist.objects.create(user=user, **kwargs)
        for i in range(1, 8):
            stylist.get_or_create_weekday_availability(Weekday(i))
            stylist.get_or_create_weekday_discount(
                Weekday(i), DEFAULT_WEEKDAY_DISCOUNT_PERCENTS[i]
            )
        return stylist
