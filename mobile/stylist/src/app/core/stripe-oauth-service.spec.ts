import { async, TestBed } from '@angular/core/testing';
import * as faker from 'faker';

import { StylistProfile } from '~/shared/api/stylist-app.models';
import {
  browserWindowMockInstance,
  inAppBrowser,
  mockCordovaInAppBrowser
} from '~/shared/oauth/instagram-oauth-service.spec';

import { TestUtils } from '~/../test';
import { StripeOAuthService } from './stripe-oauth-service';

const last10DigitsInPhone = Array(10).fill(undefined).reduce((res, _) =>
  `${res}${Math.floor(Math.abs(Math.random() * 10))}`
, '');

const fakeProfile: StylistProfile = {
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  phone: `+1${last10DigitsInPhone}`,
  public_phone: `+1${last10DigitsInPhone}`,
  salon_name: faker.commerce.productName(),
  salon_address: '',
  instagram_url: '',
  instagram_integrated: false,
  website_url: faker.internet.url(),
  followers_count: 0,
  email: faker.internet.email(),
  salon_city: faker.address.city(),
  salon_state: faker.address.state(),
  salon_zipcode: faker.address.zipCode()
};

let instance: StripeOAuthService;

describe('StripeOAuthService', () => {
  beforeEach(async(() =>
    TestUtils.beforeEachCompiler([], [StripeOAuthService])
      .then(() => {
        mockCordovaInAppBrowser();
        instance = TestBed.get(StripeOAuthService);
      })
  ));

  it('should create the service', () => {
    expect(instance).toBeTruthy();
  });

  it('should correctly do auth', async done => {
    const fakeClientId = faker.random.uuid();
    const fakeToken = faker.random.alphaNumeric();

    instance.auth(fakeClientId, fakeProfile)
      .then(token => {
        expect(browserWindowMockInstance.close)
          .toHaveBeenCalled();

        expect(token)
          .toBe(fakeToken);

        done();
      });

    const baseUrl = 'https://connect.stripe.com/oauth/authorize';
    const redirectTo = 'https://madebeauty.com/';

    expect(inAppBrowser.open)
      .toHaveBeenCalledWith(
        [
          `${baseUrl}?redirect_uri=${redirectTo}&response_type=code&client_id=${fakeClientId}&scope=read_write`,
          `&stripe_user[first_name]=${fakeProfile.first_name}`,
          `&stripe_user[last_name]=${fakeProfile.last_name}`,
          `&stripe_user[email]=${fakeProfile.email}`,
          `&stripe_user[business_name]=${fakeProfile.salon_name}`,
          `&stripe_user[url]=${fakeProfile.website_url}`,
          `&stripe_user[phone_number]=${last10DigitsInPhone}`,
          `&stripe_user[city]=${fakeProfile.salon_city}`,
          `&stripe_user[state]=${fakeProfile.salon_state}`,
          `&stripe_user[zip]=${fakeProfile.salon_zipcode}`,
          '&stripe_user[country]=US&stripe_user[currency]=usd'
        ].join(''),
        '_blank', 'location=no,hidden=yes,clearsessioncache=yes,clearcache=yes,closebuttoncaption=Cancel'
      );

    // Trigger loadstart
    browserWindowMockInstance.getEventListener('loadstart')({
      type: 'loadstart',
      url: `${redirectTo}?code=${fakeToken}`
    });
  });
});
