from decimal import Decimal

DEFAULT_TAX_RATE = Decimal(0.08875)

DEFAULT_CARD_FEE = Decimal(0.0275)

DEFAULT_FIRST_TIME_BOOK_DISCOUNT_PERCENT = 40
DEFAULT_REBOOK_WITHIN_1_WEEK_DISCOUNT_PERCENT = 35
DEFAULT_REBOOK_WITHIN_2_WEEKS_DISCOUNT_PERCENT = 25
DEFAULT_WEEKDAY_DISCOUNT_PERCENTS = {
    1: 20,
    2: 20,
    3: 20,
    4: 20,
    5: 0,
    6: 0,
    7: 0
}
