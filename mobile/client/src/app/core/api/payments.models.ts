import { StripeTokenID } from '~/payment/stripe.models';

export interface AddPaymentMethodRequest {
  stripe_token: StripeTokenID;
}

export interface PaymentMethod {
  uuid: string;
  card_brand?: string;
  card_last4?: string;
}
