import { async, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs/observable/of';
import * as faker from 'faker';

import { TestUtils } from '~/../test';
import { PaymentsApi } from '~/core/api/payments.api';
import { CardScannerService } from '~/core/card-scanner-service';

import { StripeService } from '~/payment/stripe.service.ts';
import { ProfileDataStore } from '~/profile/profile.data';

import { AddCardComponent } from './add-card.component';

let fixture: ComponentFixture<AddCardComponent>;
let instance: AddCardComponent;

const stripePublicKey = faker.random.uuid();
const stripeToken = faker.random.uuid();

const cardDetailsMock = {
  country: 'US',
  exp_month: 11,
  exp_year: 99,
  last4: '4242',
  brand: 'visa'
};

const stripeResponseMock = {
  id: stripeToken,
  card: cardDetailsMock,
  created: Date.now()
};

describe('Pages: Add Card', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([AddCardComponent], [
        CardScannerService
      ])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should add card', async done => {
    const profileData = fixture.debugElement.injector.get(ProfileDataStore);
    spyOn(profileData, 'get').and.returnValue(Promise.resolve({
      response: { stripe_public_key: stripePublicKey }
    }));

    const stripe = fixture.debugElement.injector.get(StripeService);
    spyOn(stripe, 'setPublishableKey');
    spyOn(stripe, 'validateCardNumber').and.returnValue(true);
    spyOn(stripe, 'createToken').and.returnValue(
      Promise.resolve(stripeResponseMock)
    );

    const paymentsApi = fixture.debugElement.injector.get(PaymentsApi);
    spyOn(paymentsApi, 'addPaymentMethod').and.returnValue(of({
      response: {}
    }));

    await instance.ionViewWillLoad();
    fixture.detectChanges();

    expect(stripe.setPublishableKey)
      .toHaveBeenCalledWith(stripePublicKey);

    instance.form.patchValue({
      cardNumber: '4242  4242  4242  4242',
      cardExp: '11/99',
      cardCvv: '123'
    });
    fixture.detectChanges();

    await instance.onSaveClick();

    expect(stripe.createToken)
      .toHaveBeenCalledWith({
        number: '4242424242424242',
        exp_month: '11',
        exp_year: '2099',
        cvc: '123'
      });
    expect(paymentsApi.addPaymentMethod)
      .toHaveBeenCalledWith({ stripe_token: stripeToken }, { hideAllErrors: true });

    done();
  });
});
