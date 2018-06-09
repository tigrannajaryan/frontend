# import pytest

from datetime import date, timedelta
from random import random
from typing import List

import pytest
import pytz

from freezegun import freeze_time

from client.pricing import (
    calc_client_prices,
    DiscountSettings,
    DiscountType,
    normalize_demand,
    PRICE_BLOCK_SIZE
)
from core.types import Weekday


class TestCalcClientPrices(object):

    tz = pytz.utc

    def test_invalid_arguments(self):

        # Missing demand data
        with pytest.raises(ValueError):
            discounts = DiscountSettings()
            discounts.weekday_discounts = {}
            calc_client_prices(self.tz, discounts, None, 0, [])

        # Invalid demand values
        with pytest.raises(ValueError):
            discounts = DiscountSettings()
            discounts.weekday_discounts = {}
            discounts.first_visit_percentage = 0
            discounts.revisit_within_1week_percentage = 0
            discounts.revisit_within_2week_percentage = 0
            current_demand = [2 for x in range(0, PRICE_BLOCK_SIZE)]  # Invalid
            calc_client_prices(self.tz, discounts, None, 0, current_demand)

        # Invalid discount values
        with pytest.raises(ValueError):
            discounts = DiscountSettings()
            discounts.weekday_discounts = {}
            discounts.first_visit_percentage = 200  # Invalid
            discounts.revisit_within_1week_percentage = 0
            discounts.revisit_within_2week_percentage = 0
            current_demand = [0 for x in range(0, PRICE_BLOCK_SIZE)]
            calc_client_prices(self.tz, discounts, None, 0, current_demand)

        # Invalid discount values
        with pytest.raises(ValueError):
            discounts = DiscountSettings()
            discounts.weekday_discounts = {Weekday.MONDAY: -10}  # Invalid
            discounts.first_visit_percentage = 0
            discounts.revisit_within_1week_percentage = 0
            discounts.revisit_within_2week_percentage = 0
            current_demand = [0 for x in range(0, PRICE_BLOCK_SIZE)]
            calc_client_prices(self.tz, discounts, None, 0, current_demand)

    def test_no_input_discount(self):
        current_demand = [random() for x in range(0, PRICE_BLOCK_SIZE)]

        discounts = DiscountSettings()
        discounts.weekday_discounts = {}
        discounts.first_visit_percentage = 0
        discounts.revisit_within_1week_percentage = 0
        discounts.revisit_within_2week_percentage = 0

        regular_price = 1000 * random()
        prices = calc_client_prices(self.tz, discounts, None, regular_price, current_demand)

        assert len(prices) == PRICE_BLOCK_SIZE

        # No discount on any day because no discounts are defined
        for price in prices:
            assert price.price == regular_price
            assert price.applied_discount is None

    def test_first_visit_discount_zero_demand(self):
        current_demand = [0 for x in range(0, PRICE_BLOCK_SIZE)]

        DISCOUNT = 20

        discounts = DiscountSettings()
        discounts.weekday_discounts = {}
        discounts.first_visit_percentage = DISCOUNT
        discounts.revisit_within_1week_percentage = 0
        discounts.revisit_within_2week_percentage = 0

        regular_price = 1000 * random()
        prices = calc_client_prices(self.tz, discounts, None, regular_price, current_demand)

        assert len(prices) == PRICE_BLOCK_SIZE

        # Full discount on all days because of zero demand
        for price in prices:
            assert price.price == regular_price * (1 - DISCOUNT / 100.0)
            assert price.applied_discount == DiscountType.FIRST_BOOKING

    def test_partial_demand(self):
        current_demand = [0 for x in range(0, PRICE_BLOCK_SIZE)]
        current_demand[0] = 0.11
        current_demand[1] = 0.22
        current_demand[2] = 0.33
        current_demand[3] = 0.44
        current_demand[4] = 0.55
        current_demand[5] = 0.95
        current_demand[6] = 1

        DISCOUNT = 20

        discounts = DiscountSettings()
        discounts.weekday_discounts = {}
        discounts.first_visit_percentage = DISCOUNT
        discounts.revisit_within_1week_percentage = 0
        discounts.revisit_within_2week_percentage = 0

        regular_price = 1000 * random()
        prices = calc_client_prices(self.tz, discounts, None, regular_price, current_demand)

        assert len(prices) == PRICE_BLOCK_SIZE

        # Verify that the discount percentages are granularized at 0.25 intervals
        assert prices[0].price == regular_price * (1 - 1 * DISCOUNT / 100.0)
        assert prices[1].price == regular_price * (1 - 0.75 * DISCOUNT / 100.0)
        assert prices[2].price == regular_price * (1 - 0.75 * DISCOUNT / 100.0)
        assert prices[3].price == regular_price * (1 - 0.5 * DISCOUNT / 100.0)
        assert prices[4].price == regular_price * (1 - 0.5 * DISCOUNT / 100.0)
        assert prices[5].price == regular_price * (1 - 0 * DISCOUNT / 100.0)
        assert prices[6].price == regular_price * (1 - 0 * DISCOUNT / 100.0)

        # Full discount on the rest of days because of zero demand
        for price in prices[7:]:
            assert price.price == regular_price * (1 - DISCOUNT / 100.0)
            assert price.applied_discount == DiscountType.FIRST_BOOKING

    def test_first_visit_discount_full_demand(self):

        current_demand = [1 for x in range(0, PRICE_BLOCK_SIZE)]

        discounts = DiscountSettings()
        discounts.weekday_discounts = {}
        discounts.first_visit_percentage = 20
        discounts.revisit_within_1week_percentage = 0
        discounts.revisit_within_2week_percentage = 0

        regular_price = 1000 * random()
        prices = calc_client_prices(self.tz, discounts, None, regular_price, current_demand)

        assert len(prices) == PRICE_BLOCK_SIZE

        # No discount on any day because of full demand
        for price in prices:
            assert price.price == regular_price
            assert price.applied_discount is None

    def test_first_visit_discount_specific_day_demand(self):

        # Full demand on all days except first and second
        current_demand = [1 for x in range(0, PRICE_BLOCK_SIZE)]
        current_demand[0] = 0
        PARTIAL_DEMAND = 0.5
        current_demand[1] = PARTIAL_DEMAND

        DISCOUNT = 20
        discounts = DiscountSettings()
        discounts.weekday_discounts = {}
        discounts.first_visit_percentage = DISCOUNT
        discounts.revisit_within_1week_percentage = 0
        discounts.revisit_within_2week_percentage = 0

        regular_price = 1000 * random()
        prices = calc_client_prices(self.tz, discounts, None, regular_price, current_demand)

        assert len(prices) == PRICE_BLOCK_SIZE

        # Full discount on zero demand day
        assert prices[0].price == regular_price * (1 - DISCOUNT / 100.0)
        assert prices[0].applied_discount == DiscountType.FIRST_BOOKING

        # Partial discount on partial demand day
        assert prices[1].price == regular_price * (1 - DISCOUNT / 100.0 * PARTIAL_DEMAND)
        assert prices[1].applied_discount == DiscountType.FIRST_BOOKING

        # No discount on all other days
        for price in prices[2:]:
            assert price.price == regular_price
            assert price.applied_discount is None

    @freeze_time('2018-06-09 13:30:00 UTC')     # Saturday
    def test_weekday_discount(self):

        # Zero demand on all days
        current_demand = [0 for x in range(0, PRICE_BLOCK_SIZE)]

        DISCOUNT1 = 30
        DISCOUNT2 = 20

        discounts = DiscountSettings()
        discounts.weekday_discounts = {
            Weekday.SATURDAY: DISCOUNT1
        }
        discounts.first_visit_percentage = DISCOUNT2
        discounts.revisit_within_1week_percentage = 0
        discounts.revisit_within_2week_percentage = 0

        regular_price = 1000 * random()
        prices = calc_client_prices(self.tz, discounts, None, regular_price, current_demand)

        assert len(prices) == PRICE_BLOCK_SIZE

        for i in range(0, PRICE_BLOCK_SIZE):
            if i % 7 == 0:
                # Full Saturday discount
                assert prices[i].price == regular_price * (1 - DISCOUNT1 / 100.0)
                assert prices[i].applied_discount == DiscountType.WEEKDAY
            else:
                # First time discount on all other days
                assert prices[i].price == regular_price * (1 - DISCOUNT2 / 100.0)
                assert prices[i].applied_discount == DiscountType.FIRST_BOOKING

    @freeze_time('2018-06-09 13:30:00 UTC')     # Saturday
    def test_multiple_applicable_discount(self):

        # Zero demand on all days
        current_demand = [0 for x in range(0, PRICE_BLOCK_SIZE)]

        DISCOUNT1 = 30
        DISCOUNT2 = 40

        discounts = DiscountSettings()
        discounts.weekday_discounts = {
            Weekday.SATURDAY: DISCOUNT1
        }
        discounts.first_visit_percentage = DISCOUNT2
        discounts.revisit_within_1week_percentage = 0
        discounts.revisit_within_2week_percentage = 0

        regular_price = 1000 * random()
        prices = calc_client_prices(self.tz, discounts, None, regular_price, current_demand)

        assert len(prices) == PRICE_BLOCK_SIZE

        # First time discount on all days
        for i in range(0, PRICE_BLOCK_SIZE):
            assert prices[i].price == regular_price * (1 - DISCOUNT2 / 100.0)
            assert prices[i].applied_discount == DiscountType.FIRST_BOOKING

    @freeze_time('2018-06-09 13:30:00 UTC')
    def test_no_applicable_discount(self):

        # Zero demand on all days
        current_demand = [0 for x in range(0, PRICE_BLOCK_SIZE)]

        DISCOUNT1 = 20
        DISCOUNT2 = 30
        DISCOUNT3 = 40

        discounts = DiscountSettings()
        discounts.weekday_discounts = {
        }
        discounts.first_visit_percentage = DISCOUNT1
        discounts.revisit_within_1week_percentage = DISCOUNT3
        discounts.revisit_within_2week_percentage = DISCOUNT2

        last_visit_date = date(2018, 5, 25)
        regular_price = 1000 * random()
        prices = calc_client_prices(self.tz, discounts, last_visit_date, regular_price,
                                    current_demand)

        assert len(prices) == PRICE_BLOCK_SIZE

        # No discount on any days
        for i in range(0, PRICE_BLOCK_SIZE):
            assert prices[i].price == regular_price
            assert prices[i].applied_discount is None

    @freeze_time('2018-06-09 13:30:00 UTC')
    def test_revisit_within_1and2week(self):

        # Zero demand on all days
        current_demand = [0 for x in range(0, PRICE_BLOCK_SIZE)]

        DISCOUNT1 = 50
        DISCOUNT2 = 40
        DISCOUNT3 = 30

        discounts = DiscountSettings()
        discounts.weekday_discounts = {
        }
        discounts.first_visit_percentage = DISCOUNT1
        discounts.revisit_within_1week_percentage = DISCOUNT2
        discounts.revisit_within_2week_percentage = DISCOUNT3

        last_visit_date = date(2018, 6, 2)
        regular_price = 1000 * random()
        prices = calc_client_prices(self.tz, discounts, last_visit_date, regular_price,
                                    current_demand)

        assert len(prices) == PRICE_BLOCK_SIZE

        # revisit_within_1week_percentage discount on first day
        assert prices[0].price == regular_price * (1 - DISCOUNT2 / 100.0)
        assert prices[0].applied_discount == DiscountType.REVISIT_WITHIN_1WEEK

        # revisit_within_2week_percentage discount on next 7 days
        for i in range(1, min(8, PRICE_BLOCK_SIZE)):
            assert prices[i].price == regular_price * (1 - DISCOUNT3 / 100.0)
            assert prices[i].applied_discount is DiscountType.REVISIT_WITHIN_2WEEK

        # No discount for the rest of days
        for i in range(8, PRICE_BLOCK_SIZE):
            assert prices[i].price == regular_price
            assert prices[i].applied_discount is None


class TestNormalizeDemand(object):

    def test_negative_availability(self):
        weekday_available_hours = {
            Weekday.SUNDAY: timedelta(hours=-2)
        }

        with pytest.raises(ValueError):
            normalize_demand(
                date(2018, 6, 10),  # start from Sunday
                abs_demands=[timedelta(hours=1)],
                weekday_available_hours=weekday_available_hours
            )

    def test_negative_demand(self):
        weekday_available_hours = {
            Weekday.SUNDAY: timedelta(hours=2)
        }

        with pytest.raises(ValueError):
            normalize_demand(
                date(2018, 6, 10),  # start from Sunday
                abs_demands=[timedelta(hours=-1)],
                weekday_available_hours=weekday_available_hours
            )

    def test_no_working_time(self):
        normalized: List[float] = normalize_demand(
            date(2018, 6, 2),
            abs_demands=[timedelta(hours=1), timedelta(hours=2), timedelta(hours=3)],
            weekday_available_hours={})

        # Regardless of absolute demand normalized should be 1 because
        # there is no working time available
        assert normalized == [1, 1, 1]

    def test_one_weekday(self):
        weekday_available_hours = {
            Weekday.SUNDAY: timedelta(hours=2),
            Weekday.MONDAY: timedelta(hours=5),
            Weekday.TUESDAY: timedelta(hours=6),
            Weekday.WEDNESDAY: timedelta(hours=0)
        }

        normalized: List[float] = normalize_demand(
            date(2018, 6, 10),  # start from Sunday
            abs_demands=[timedelta(hours=1), timedelta(hours=2), timedelta(hours=0),
                         timedelta(hours=1), timedelta(hours=1)],
            weekday_available_hours=weekday_available_hours
        )

        assert normalized == [1 / 2, 2 / 5, 0 / 6, 1, 1]
