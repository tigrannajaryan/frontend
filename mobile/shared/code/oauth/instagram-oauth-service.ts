import { Injectable } from '@angular/core';

import { AbstractOAuthService, InAppBrowserEvent } from '~/shared/oauth/abstract-oauth-service';
import { reportToSentry } from '~/shared/sentry';

@Injectable()
export class InstagramOAuthService extends AbstractOAuthService {
  baseUrl = 'https://api.instagram.com/oauth/authorize/';

  /**
   * Instagram’s OAuth implementation:
   * 1. open a browser page with redirect uri and basic scope params,
   * 2. wait for user to pass instagram’s registration,
   * 3. when redirected back (handled in loadstart) retrieve the token value.
   *
   * This is known as Client-Side (Implicit) Authentication which can be found
   * in https://www.instagram.com/developer/authentication/ guide.
   *
   * NOTE: the OAuth used here (basic scope) will be deprecated/disabled in early 2020.
   */
  async auth(clientId: string): Promise<string> {
    const params = {
      redirect_uri: this.redirectTo,
      response_type: 'token',
      client_id: clientId
    };
    const event = (await this.runOAuth(params)) as InAppBrowserEvent;
    const token = event.url.match(/access_token=([\w|\.]+)/);
    if (token && token[1]) {
      return token[1].toString();
    } else {
      const error = new Error(`Cannot retrieve Instagram access token from ${event.url}.`);
      reportToSentry(error);
    }
  }
}
