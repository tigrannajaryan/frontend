from decimal import Decimal

from ..constants import DEFAULT_CARD_FEE, DEFAULT_TAX_RATE


def post_or_get(request, key, default=None):
    return request.POST.get(key, request.GET.get(key, default))


def calculate_tax(original_cost: Decimal) -> Decimal:
    return original_cost * DEFAULT_TAX_RATE


def calculate_card_fee(original_cost: Decimal) -> Decimal:
    return original_cost * DEFAULT_CARD_FEE
