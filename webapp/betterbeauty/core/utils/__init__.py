from decimal import Decimal

from ..constants import DEFAULT_CARD_FEE, DEFAULT_TAX_RATE
from ..types import AppointmentPrices


def post_or_get(request, key, default=None):
    return request.POST.get(key, request.GET.get(key, default))


def calculate_tax(original_cost: Decimal) -> Decimal:
    return original_cost * DEFAULT_TAX_RATE


def calculate_card_fee(original_cost: Decimal) -> Decimal:
    return original_cost * DEFAULT_CARD_FEE


def calculate_appointment_prices(
        price_before_tax: Decimal,
        include_card_fee: bool,
        include_tax: bool
) -> AppointmentPrices:
    grand_total: Decimal = price_before_tax
    total_tax = calculate_tax(price_before_tax)
    if include_tax:
        grand_total += total_tax
    card_fee = calculate_card_fee(grand_total)
    if include_card_fee:
        grand_total += card_fee
    return AppointmentPrices(
        total_client_price_before_tax=price_before_tax,
        total_tax=total_tax,
        total_card_fee=card_fee,
        grand_total=grand_total,
        has_tax_included=include_tax,
        has_card_fee_included=include_card_fee
    )
