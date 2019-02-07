import { Component, Input } from '@angular/core';

import { PaymentMethod, PaymentType } from '~/core/api/payments.models';
import { StripeCardBrand } from '~/payment/stripe.models';

export type IconPath =
  | 'amazon'
  | 'american_express'
  | 'cash'
  | 'cirrus'
  | 'diners_club'
  | 'discover'
  | 'ebay'
  | 'jcb'
  | 'maestro'
  | 'mastercard'
  | 'paypal'
  | 'sage'
  | 'shopify'
  | 'skrill'
  | 'unionpay'
  | 'unknown'
  | 'visa_electron'
  | 'visa'
  | 'western_union'
  | 'worldpay';

@Component({
  selector: 'payment-icon',
  templateUrl: 'payment-icon.component.html'
})
export class PaymentIconComponent {
  /**
   * Icon can be retrieved from paymentMethod param
   * or directly supplied as icon path.
   */
  @Input() paymentMethod: PaymentMethod;
  @Input() icon: IconPath;

  static iconPath(iconPath: IconPath): string {
    return `assets/icons/payment/${iconPath}.png`;
  }

  getIconSrc(): string {
    if (this.icon) {
      return PaymentIconComponent.iconPath(this.icon);

    } else if (this.paymentMethod && this.paymentMethod.type === PaymentType.Card) {
      // We only support cards now.
      switch (this.paymentMethod.card_brand) {
        case StripeCardBrand.AmericanExpress:
          return PaymentIconComponent.iconPath('american_express');

        case StripeCardBrand.DinersClub:
          return PaymentIconComponent.iconPath('diners_club');

        case StripeCardBrand.Discover:
          return PaymentIconComponent.iconPath('discover');

        case StripeCardBrand.JCB:
          return PaymentIconComponent.iconPath('jcb');

        case StripeCardBrand.MasterCard:
          return PaymentIconComponent.iconPath('mastercard');

        case StripeCardBrand.UnionPay:
          return PaymentIconComponent.iconPath('unionpay');

        case StripeCardBrand.Visa:
          return PaymentIconComponent.iconPath('visa');

        case StripeCardBrand.Unknown:
        default:
          return PaymentIconComponent.iconPath('unknown');
      }
    } else {
      return PaymentIconComponent.iconPath('cash');
    }
  }
}
