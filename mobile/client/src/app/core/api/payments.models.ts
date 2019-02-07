import { StripeCardBrand, StripeTokenID } from '~/payment/stripe.models';

export interface AddPaymentMethodRequest {
  stripe_token: StripeTokenID;

  // TODO: remove in production, only for testing Stripe API
  brand?: string;
  last4?: string;
}

export enum PaymentType {
  Card = 'card' // through Stripe
}

export interface PaymentMethod {
  uuid: string;
  type: PaymentType;
  card_brand?: StripeCardBrand;
  card_last4?: string;
}

export interface GetPaymentMethodsResponse {
  payment_methods: PaymentMethod[];
}
