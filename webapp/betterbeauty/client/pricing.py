from datetime import date, datetime, timedelta, tzinfo
from enum import Enum
from typing import Dict, List, NamedTuple, Optional

from core.types import Weekday


class DiscountType(Enum):
    FIRST_BOOKING = 1
    REVISIT_WITHIN_1WEEK = 2
    REVISIT_WITHIN_2WEEK = 3
    WEEKDAY = 4


class DiscountSettings(object):
    # Discount values are in [0..100] range, expressed as percentages
    weekday_discounts: Dict[Weekday, float]
    first_visit_percentage: float
    revisit_within_1week_percentage: float
    revisit_within_2week_percentage: float


class CalculatedPrice(object):
    price: float
    applied_discount: Optional[DiscountType]


# How many days of price calculation to perform at once
PRICE_BLOCK_SIZE = 31

# When interpolating the discount based on the demand the
# final discount percentage is granularized to avoid prices
# from being too sensittive to small demand deviations
# Since the normalized demand values are in [0..1] range the
# 0.25 granularization value results in only 4 possible
# values for final calculated discount. This value can be set
# to anything that fits a whole number of times between 0 and 1,
# possible reasonable value are likely around 0.1, 0.2, 0.25.
DISCOUNT_GRANULARIZATION = 0.25

assert round(1 / DISCOUNT_GRANULARIZATION) == 1 / DISCOUNT_GRANULARIZATION


def calc_client_prices(
        stylist_timezone: tzinfo,
        discounts: DiscountSettings,
        last_visit_date: Optional[date],
        regular_price: float,
        current_demand: List[float]) -> List[CalculatedPrice]:
    """
    Calculate client prices for PRICE_BLOCK_SIZE days starting from today's date in stylists's
    timezone. For each particular day finds the maximum applicable discount. Then that
    discount is fully applied if the day's demand is minimal within all the days in the
    PRICE_BLOCK_SIZE. If the demand is higher than the minimal then the discount value
    is linearly interpolated so that zero discount corresponds to a fully booked day.
    The final applied discount is granularized, so that only some possible portions of
    discount percentage are ever used. This ensures that the prices don't jump around from
    minor demand fluctuations. See description of DISCOUNT_GRANULARIZATION for more details.

    The implemented simple heuristic approach has the following desirable characteritic:
    the discount applied is inverselly proportional to the demand, i.e. higher demand results in
    less discount and higher pricing. This is inline with our intuitive understanding of how
    the dynamic pricing should work.

    Note that the results of this function depend on the start date and block size
    (because we use minimum demand value in the block for the rest of calculations),
    that's why this function does not accept start date or block size as parameters.
    It helps ensure we always work with the same window of dates and the results are
    stable.

    Args:
        stylist_timezone: timezone of the stylist. Used to correctly determine today's date.

        discounts: the definitions of discounts for the stylist.

        last_visit_date: last time the client visited. None if they never visited (e.g.
            new client).

        regular_price: the regular price for the service.

        current_demand: A list of PRICE_BLOCK_SIZE items. Each item describes the demand for one
            day, the first item corresponds to today. The demand is a normalized number between 0
            and 1. 0 means there are no booked appointments for that day. 1 means the day is
            fully booked, no more appointments should be accepted. Usually calculated as
            (total booked time)/(total available time). normalize_demand() can be used to convert
            absolute demand values to normalized.

    Returns:
        A list of PRICE_BLOCK_SIZE items with prices. The first item represents today.

    Raises:
        ValueError exception on invalid input.
    """

    if (len(current_demand) != PRICE_BLOCK_SIZE):
        raise ValueError(f"current_demand must have {PRICE_BLOCK_SIZE} elements")

    min_demand = min(current_demand)
    max_demand = max(current_demand)
    if not (0 <= min_demand <= 1 and 0 <= max_demand <= 1):
        raise ValueError("Demand values must be in [0..1] range")

    if (not is_valid_discount_percentage(discounts.first_visit_percentage) or
            not is_valid_discount_percentage(discounts.revisit_within_1week_percentage) or
            not is_valid_discount_percentage(discounts.revisit_within_2week_percentage)):
        raise ValueError("Invalid discount value")

    for discount in discounts.weekday_discounts.values():
        if not is_valid_discount_percentage(discount):
            raise ValueError("Invalid weekday discount value")

    results: List[CalculatedPrice] = []

    for i in range(0, PRICE_BLOCK_SIZE):
        today = datetime.now(stylist_timezone).date()
        dt = today + timedelta(days=i)
        calculated_price = CalculatedPrice()

        max_discount = find_applicable_discount(discounts, last_visit_date, dt)
        if max_discount is None:
            calculated_price.price = regular_price
            calculated_price.applied_discount = None
        else:
            demand = current_demand[i]

            if min_demand < 1:
                # linearly interpolate the discount between 0 and max_discount
                # for demands in the range of [1 .. min_demand]. This means that
                # on the days with minimal demand full discount will be applied
                # and on the days that are fully booked zero discount will be applied
                # (actually no booking should be allowed on those days at all).
                apply_discount_part = (1 - demand) / (1 - min_demand)

                # Introduce granularity to the lienar interpolation so that the
                # the final prices fall into a few buckets instead of forming
                # a more continuous spectrum, which would be more precise but
                # undesirable from user perspective. The granularity ensures that
                # small changes in demand do not cause all prices to jump around
                # and brings some stability to them.
                apply_discount_part = granularize(apply_discount_part,
                                                  DISCOUNT_GRANULARIZATION)

                # Calculate discount percentage to apply as a portion of
                # maximum applicable discount.
                discount_percentage = (max_discount.discount_percentage *
                                       apply_discount_part)
            else:
                # The current demand is full on all days, no discount
                discount_percentage = 0

            price = regular_price * (1 - discount_percentage / 100.0)
            calculated_price.price = price

            if discount_percentage > 0:
                calculated_price.applied_discount = max_discount.type
            else:
                calculated_price.applied_discount = None

        results.append(calculated_price)

    return results


def is_valid_discount_percentage(discount_percentage: float) -> bool:
    return 0 <= discount_percentage <= 100


def granularize(value: float, granularity: float) -> float:
    value = round(value / granularity) * granularity
    return value


class DiscountDescr(NamedTuple):
    type: DiscountType
    discount_percentage: float


def find_applicable_discount(
        discounts: DiscountSettings,
        last_visit_date: Optional[date],
        for_date: date) -> Optional[DiscountDescr]:
    """
    Return the maximum applicable discount

    Args:
        discounts: the definitions of discounts for the stylist
        last_visit_date: last time the client visited. None if they never visited (e.g. new client)
        for_date: the date to get the applicable discount for

    Returns:
        the tuple describing the type and amount of discount or None if there are no
        applicable discounts.
    """

    all_discounts: List[DiscountDescr] = []

    # Applicable weekday discount
    weekday = Weekday(for_date.isoweekday())
    weekday_discount = discounts.weekday_discounts.get(weekday)
    if weekday_discount is not None:
        discount_descr = DiscountDescr(DiscountType.WEEKDAY, weekday_discount)
        all_discounts.append(discount_descr)

    if (last_visit_date is None):
        # First time visit
        discount_descr = DiscountDescr(DiscountType.FIRST_BOOKING,
                                       discounts.first_visit_percentage)
        all_discounts.append(discount_descr)
    else:
        # Not the first time
        if last_visit_date + timedelta(weeks=1) >= for_date:
            # Within one week since last visit
            discount_descr = DiscountDescr(DiscountType.REVISIT_WITHIN_1WEEK,
                                           discounts.revisit_within_1week_percentage)
            all_discounts.append(discount_descr)

        elif last_visit_date + timedelta(weeks=2) >= for_date:
            # Within two weeks since last visit
            discount_descr = DiscountDescr(DiscountType.REVISIT_WITHIN_2WEEK,
                                           discounts.revisit_within_2week_percentage)
            all_discounts.append(discount_descr)

    max_discount = max(all_discounts, default=None, key=lambda d: d.discount_percentage)

    return max_discount


def normalize_demand(
        start_date: date,
        abs_demands: List[timedelta],
        weekday_available_hours: Dict[Weekday, timedelta]) -> List[float]:
    """
    Convert absolute demand values expressed as durations into normalized demand
    values in [0..1] range. Use to prepare demand values for calc_client_prices()
    function.

    Args:
        start_date - the date of first element in abs_demand list

        abs_demands - a list of demands, one element per day starting from start_date.
            Each element is the total duration of booked services on that date.
            The timedelta value must be positive.

        weekday_available_hours - a dictionary containing the duration that the
            stylist is available to work on a particular weekday.
            The timedelta value must be positive.

    Returns:
        A list of normalized demands, one element per day starting from start_date.


    Raises:
        ValueError exception on invalid input.
    """
    results: List[float] = []
    for i in range(0, len(abs_demands)):
        dt = start_date + timedelta(days=i)
        weekday = Weekday(dt.isoweekday())

        available: timedelta = weekday_available_hours.get(weekday, None)
        if available is None:
            normalized_demand = 1.0
        else:
            if available < timedelta(0):
                raise ValueError("weekday_available_hours must be positive timedelta values")

            try:
                demand = abs_demands[i]
                if demand < timedelta(0):
                    raise ValueError("abs_demands must be positive timedelta values")

                normalized_demand = float(demand / available)
            except ZeroDivisionError:
                normalized_demand = 1.0

        results.append(normalized_demand)

    return results
