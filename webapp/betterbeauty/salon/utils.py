import datetime
from itertools import compress
from math import trunc
from typing import Dict, Iterable, List, Optional, Tuple

from django.db import transaction

from appointment.constants import AppointmentStatus
from appointment.models import Appointment
from client.models import ClientOfStylist
from core.constants import (
    DEFAULT_FIRST_TIME_BOOK_DISCOUNT_PERCENT,
    DEFAULT_REBOOK_WITHIN_1_WEEK_DISCOUNT_PERCENT,
    DEFAULT_REBOOK_WITHIN_2_WEEKS_DISCOUNT_PERCENT,
    DEFAULT_WEEKDAY_DISCOUNT_PERCENTS,
)
from core.models import User
from core.types import Weekday
from pricing import (
    calc_client_prices,
    CalculatedPrice,
    DiscountSettings,
)
from pricing.constants import COMPLETELY_BOOKED_DEMAND, PRICE_BLOCK_SIZE
from salon.models import Stylist, StylistAvailableWeekDay, StylistService


def generate_demand_list_for_stylist(
        stylist: Stylist, dates: List[datetime.date]
) -> List[float]:
    """
    Generate list of 0..1 float values for each date supplied. Demand is generated
    based on formula: appointment_count * service_time_gap / available_time_during_day.
    If resulting demand value is > 1, we set it to 1. If no time is available during
    a day (or stylist is just unavailable on particular date) demand value will also
    be equal to 1
    """
    weekday_available_times = {}

    # generate time availability based on weekday to avoid multiple DB requests
    for weekday in range(1, 8):
        available_weekday: StylistAvailableWeekDay = stylist.available_days.filter(
            weekday=weekday
        ).last()
        if not available_weekday:
            weekday_available_times.update({
                weekday: datetime.timedelta(0)
            })
        else:
            weekday_available_times.update({
                weekday: available_weekday.get_available_time()
            })

    time_gap = stylist.service_time_gap
    demand_list = []

    for date in dates:
        midnight = stylist.with_salon_tz(datetime.datetime.combine(date, datetime.time(0, 0)))
        next_midnight = midnight + datetime.timedelta(days=1)
        work_day_duration = weekday_available_times[date.isoweekday()]
        load_on_date_duration = stylist.appointments.filter(
            datetime_start_at__gte=midnight, datetime_start_at__lt=next_midnight,
        ).exclude(status__in=[
            AppointmentStatus.CANCELLED_BY_STYLIST,
            AppointmentStatus.CANCELLED_BY_CLIENT]
        ).count() * time_gap
        demand_on_date = (
            load_on_date_duration / work_day_duration
            if work_day_duration > datetime.timedelta(0)
            else COMPLETELY_BOOKED_DEMAND
        )
        # Technically, there may be a situation of overbooking, which may cause actual
        # demand be > 1; in this case we'll cast it to 1 manually
        if demand_on_date > 1:
            demand_on_date = 1
        demand_list.append(demand_on_date)
    return demand_list


def get_last_visit_date_for_client(
        stylist: Stylist, client: ClientOfStylist
) -> Optional[datetime.date]:
    """Return last checked out appointment between stylist and client"""
    last_appointment: Optional[Appointment] = Appointment.objects.filter(
        stylist=stylist,
        client=client,
        status=AppointmentStatus.CHECKED_OUT
    ).order_by('datetime_start_at').last()

    if last_appointment:
        return last_appointment.datetime_start_at.date()
    return None


def generate_discount_settings_for_stylist(
        stylist: Stylist
) -> DiscountSettings:
    """Translate Stylist's discount settings to DiscountSettings object"""
    discounts = DiscountSettings()
    discounts.weekday_discounts = {
        Weekday(discount.weekday): discount.discount_percent
        for discount in stylist.weekday_discounts.all()
    }

    # We set first time discount to 0% because First Time Discount makes no sense
    # without Client App. See https://github.com/madebeauty/monorepo/issues/375
    # As soon as the Client App is released we need to distinguish between
    # appointments added by stylist and set first time discount to 0% in that
    # and appointments added by client and set first time discount to
    # be equal to stylist.first_time_book_discount_percent.
    discounts.first_visit_percentage = 0

    discounts.revisit_within_1week_percentage = (
        stylist.rebook_within_1_week_discount_percent
    )
    discounts.revisit_within_2week_percentage = (
        stylist.rebook_within_2_weeks_discount_percent
    )
    return discounts


def generate_prices_for_stylist_service(
        service: StylistService,
        client: Optional[ClientOfStylist],
        exclude_fully_booked: bool=False
) -> Iterable[Tuple[datetime.date, CalculatedPrice]]:
    """
    Generate prices for given stylist, client and service for PRICE_BLOCK_SIZE days ahead

    :param service: Service to generate prices for
    :param client: (optional) Client object, if omitted no client-specific discounts will apply
    :param exclude_fully_booked: whether or not remove fully booked/unavailable dates
    :return: Iterator over (date, CalculatedPrice)
    """
    stylist = service.stylist

    last_visit_date = get_last_visit_date_for_client(stylist, client) if client else None

    today = stylist.get_current_now().date()
    dates_list = [today + datetime.timedelta(days=i) for i in range(0, PRICE_BLOCK_SIZE)]
    demand_list = generate_demand_list_for_stylist(stylist=stylist, dates=dates_list)

    discounts = generate_discount_settings_for_stylist(stylist)

    prices_list = calc_client_prices(
        stylist.salon.timezone,
        discounts,
        last_visit_date,
        float(service.regular_price),
        demand_list
    )

    prices_on_dates = zip(dates_list, prices_list)

    if exclude_fully_booked:
        # remove dates where demand is equal to COMPLETELY_BOOKED_DEMAND
        demand_filter = [d < COMPLETELY_BOOKED_DEMAND for d in demand_list]
        return compress(prices_on_dates, demand_filter)

    return prices_on_dates


def calculate_price_and_discount_for_client_on_date(
        service: StylistService, client: Optional[ClientOfStylist], date: datetime.date
) -> CalculatedPrice:
    prices: Dict[datetime.date, CalculatedPrice] = dict(
        generate_prices_for_stylist_service(
            service=service, client=client, exclude_fully_booked=True
        )
    )
    if date in prices:
        return prices[date]
    # Return base price if day does not appear to be available for booking
    calculated_price = CalculatedPrice.build(
        price=trunc(service.regular_price), applied_discount=None, discount_percentage=0
    )
    return calculated_price


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
