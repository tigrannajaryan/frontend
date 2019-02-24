import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';

import { StylistProfile } from '~/shared/api/stylist-app.models';
import { DEFAULT_COUNTRY_CODE } from '~/shared/directives/phone-input.directive';
import { AbstractOAuthService, GetParams, InAppBrowserEvent } from '~/shared/oauth/abstract-oauth-service';
import { reportToSentry } from '~/shared/sentry';
import { showAlert } from '~/shared/utils/alert';
import { currency } from '~/shared/constants';

type StripeAdditionalParamKey =
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'business_name'
  | 'url'
  | 'phone_number'
  | 'city'
  | 'state'
  | 'zip';

@Injectable()
export class StripeOAuthService extends AbstractOAuthService {
  baseUrl = 'https://connect.stripe.com/oauth/authorize';

  constructor(
    protected loadingCtrl: LoadingController
  ) {
    super();
  }

  async auth(clientId: string, profile: StylistProfile): Promise<string> {
    const params = {
      redirect_uri: this.redirectTo,
      response_type: 'code',
      client_id: clientId,
      scope: 'read_write',
      // Pre-fill Stripe registration fields with stylist’s profile data:
      ...getProfileParams(profile)
    };

    let event: InAppBrowserEvent;
    try {
      event = (await this.runOAuth(params)) as InAppBrowserEvent;
    } catch (error) {
      showAlert('', 'Unable to add payment method');
      return;
    }
    const code = event.url.match(/code=([\w|\.]+)/);
    if (code && code[1]) {
      return code[1].toString();
    } else {
      const error = new Error(`Cannot retrieve Stripe code from ${event.url}.`);
      reportToSentry(error);
    }
  }
}

function getProfileParams(profile: StylistProfile): GetParams {
  if (!profile) {
    return {};
  }
  const params = {};
  const profileToParam: Array<StripeAdditionalParamKey | [StripeAdditionalParamKey, keyof StylistProfile]> = [
    'first_name', 'last_name', 'email',
    ['business_name', 'salon_name'],
    ['url', 'website_url'],
    ['phone_number', 'phone'],
    ['city', 'salon_city'],
    ['state', 'salon_state'],
    ['zip', 'salon_zipcode']
  ];
  profileToParam
    .map(mapping => {
      // Return array of [key => profile_value]
      if (mapping instanceof Array) {
        const [paramKey, profileKey] = mapping;
        return [paramKey, profile[profileKey]];
      }
      return [mapping, profile[mapping]];
    })
    .forEach(([paramKey, profileValue]) => {
      if (profileValue) {
        switch (paramKey as StripeAdditionalParamKey) {
          case 'phone_number':
            // The business phone number must be 10 digits only:
            params[`stripe_user[${paramKey}]`] = profileValue.slice(-10);
            break;
          default:
            params[`stripe_user[${paramKey}]`] = profileValue;
            break;
        }
      }
    });
  params['stripe_user[country]'] = DEFAULT_COUNTRY_CODE;
  params['stripe_user[currency]'] = currency;
  return params;
}
