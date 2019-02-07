import { Injectable } from '@angular/core';

import {
  StripeCardRequest,
  StripeError,
  StripeHttpStatus,
  StripeResponse,
  StripeTokenID,
  StripeV2
} from './stripe.models';

declare const Stripe: StripeV2;

@Injectable()
export class StripeService {
  static STRIPE_SRC = 'https://js.stripe.com/v2/';

  // Reject loading of stripe after ms
  static WAIT_UNTIL_REJECT = 7000;

  // Indicates Stripe JS is loaded
  private loaded: Promise<void>;

  // Async Stripe JS loading
  static loadStripeJS(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      script.src = StripeService.STRIPE_SRC;
      document.head.appendChild(script);

      // TODO: test with disabled network ”Please, enable network to receive payments”

      const timeout = setTimeout(() => {
        reject(new Error(`Stripe doesn’t load after ${StripeService.WAIT_UNTIL_REJECT / 1000}s`));
      }, StripeService.WAIT_UNTIL_REJECT);
    });
  }

  constructor(
  ) {
    this.loaded = StripeService.loadStripeJS();
  }

  async setPublishableKey(key: string): Promise<void> {
    await this.loaded;
    Stripe.setPublishableKey(key);
  }

  async createToken(card: StripeCardRequest): Promise<StripeResponse> {
    await this.loaded;
    return new Promise((resolve, reject) => {
      Stripe.card.createToken(card,
        (status: StripeHttpStatus, response: StripeResponse) => {
          if (/2\d{2}/.test(String(status))) { // 2xx
            resolve(response);
          } else { // 4xx
            reject(response && response.error);
          }
        }
      );
    });
  }
}
