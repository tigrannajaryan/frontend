/**
 * Needed to request card token
 */
export interface StripeCardRequest {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
}

export enum StripeCardBrand {
  AmericanExpress = 'american express',
  DinersClub = 'diners club',
  Discover = 'discover',
  JCB = 'jcb',
  MasterCard = 'mastercard',
  UnionPay = 'unionpay',
  Visa = 'visa',
  Unknown = 'unknown'
}

export interface StripeCardDetails {
  country: string;    // 2 uppercased letters
  exp_month: number;
  exp_year: number;
  last4: string;      // last 4 digits of card
  brand: StripeCardBrand;      // e.g. 'Visa'
  // ...
  // see more on https://stripe.com/docs/stripe-js/v2
}

/**
 * 200 - OK                Everything worked as expected.
 * 400 - Bad Request       Often missing a required parameter.
 * 401 - Unauthorized      No valid API key provided.
 * 402 - Request Failed    Parameters were valid but request failed.
 * 404 - Not Found         The requested item doesn't exist.
 * 500, 502, 503, 504      Server Errors Something went wrong on Stripe's end.
 */
export type StripeHttpStatus = number;

export type StripeErrorType =
  // Failure to connect to Stripe's API.
  | 'api_connection_error'

  // API errors cover any other type of problem
  // (e.g., a temporary problem with Stripe's servers),
  // and are extremely uncommon.
  | 'api_error'

  // Failure to properly authenticate yourself in the request.
  | 'authentication_error'

  // Card errors are the most common type of error you should
  // expect to handle. They result when the user enters a card
  // that can't be charged for some reason.
  | 'card_error'

  // Invalid request errors arise when your request has invalid parameters.
  | 'invalid_request_error'

  // Too many requests hit the API too quickly.
  | 'rate_limit_error'

  // Errors triggered by our client-side libraries when failing
  // to validate fields (e.g., when a card number or expiration
  // date is invalid or incomplete).
  | 'validation_error';

export type StripeErrorCode =
  | 'incorrect_number'          // The card number is incorrect.
  | 'invalid_number'            // The card number is not a valid credit card number.
  | 'invalid_expiry_month'      // The card's expiration month is invalid.
  | 'invalid_expiry_year'       // The card's expiration year is invalid.
  | 'invalid_cvc'               // The card's security code is invalid.
  | 'expired_card'              // The card has expired.
  | 'incorrect_cvc'             // The card's security code is incorrect.
  | 'incorrect_zip'             // The card's zip code failed validation.
  | 'card_declined'             // The card was declined.
  | 'missing'                   // There is no card on a customer that is being charged.
  | 'processing_error'          // An error occurred while processing the card.
  | 'rate_limit';               // An error occurred due to requests hitting the API too
                                // quickly. Please let us know if you're consistently running
                                // into this error.

export interface StripeError {
  type: StripeErrorType;

  code?: StripeErrorCode;

  /**
   * A human-readable message giving more details about the error. For card errors, these messages can
   * be shown to your users.
   */
  message?: string;

  /**
   * The parameter the error relates to if the error is parameter-specific. You can use this to display a
   * message near the correct form field, for example.
   */
  param?: string;
}

export type StripeTokenID = string;

export interface StripeResponse {
  id: StripeTokenID;
  card: StripeCardDetails;
  created: number;      // Timestamp of when token was created
  error?: StripeError;
}

export type StripeResponseHandler = (status: StripeHttpStatus, response: StripeResponse) => void | Promise<void>;

export interface StripeCard {
  createToken(card: StripeCardRequest, stripeResponseHandler: StripeResponseHandler): void;
}

export interface StripeV2 {
  card: StripeCard;
  setPublishableKey(key: string): void;
  validateCardNumber(cardNumber: string): boolean;
}
