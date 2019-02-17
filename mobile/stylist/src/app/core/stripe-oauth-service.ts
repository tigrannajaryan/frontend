import { Injectable } from '@angular/core';

import { AbstractOAuthService, InAppBrowserEvent } from '~/shared/oauth/abstract-oauth-service';
import { reportToSentry } from '~/shared/sentry';

@Injectable()
export class StripeOAuthService extends AbstractOAuthService {
  baseUrl = 'https://connect.stripe.com/oauth/authorize';

  async auth(clientId: string): Promise<string> {
    const params = {
      redirect_uri: this.redirectTo,
      response_type: 'code',
      client_id: clientId,
      scope: 'read_write'
    };
    const event = (await this.runOAuth(params)) as InAppBrowserEvent;
    const code = event.url.match(/code=([\w|\.]+)/);
    if (code && code[1]) {
      return code[1].toString();
    } else {
      const error = new Error(`Cannot retrieve Stripe code from ${event.url}.`);
      reportToSentry(error);
    }
  }
}