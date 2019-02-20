import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavParams, ViewController } from 'ionic-angular';
import { ViewControllerMock } from 'ionic-mocks';
import { of } from 'rxjs/observable/of';
import * as faker from 'faker';
import * as moment from 'moment';

import { AppointmentStatus, StylistAppointmentModel } from '~/shared/api/appointments.models';
import { AddIntegrationRequest, IntegrationsApi, IntegrationTypes } from '~/shared/api/integrations.api';
import { IntegrationsApiMock } from '~/shared/api/integrations.api.mock';

import { TestUtils } from '~/../test';
import { StripeOAuthService } from '~/core/stripe-oauth-service';

import { GetPaidPopupComponent, GetPaidPopupParams } from './get-paid-popup.component';

let fixture: ComponentFixture<GetPaidPopupComponent>;
let instance: GetPaidPopupComponent;
let params: GetPaidPopupParams;

const appointmentMock: StylistAppointmentModel = {
  uuid: faker.random.uuid(),
  created_at: moment().format(),
  datetime_start_at: moment().format(),
  duration_minutes: 0,
  status: AppointmentStatus.new,
  services: [],
  // Price
  total_client_price_before_tax: faker.random.number(),
  total_card_fee: faker.random.number(),
  grand_total: faker.random.number(),
  total_tax: faker.random.number(),
  tax_percentage: faker.random.number(),
  card_fee_percentage: faker.random.number(),
  has_tax_included: false,
  has_card_fee_included: false,
  total_discount_amount: faker.random.number(),
  total_discount_percentage: faker.random.number(),
  // Client
  client_uuid: faker.random.uuid(),
  client_first_name: faker.name.firstName(),
  client_last_name: faker.name.lastName(),
  client_phone: faker.phone.phoneNumber(),
  client_profile_photo_url: faker.image.imageUrl(),
  // Payment
  stripe_connect_client_id: faker.random.uuid(),
  can_checkout_with_made: false
};

describe('GetPaidPopupComponent', () => {
  beforeEach(async(() =>
    TestUtils.beforeEachCompiler([GetPaidPopupComponent], [
      StripeOAuthService,
      { provide: IntegrationsApi, useClass: IntegrationsApiMock },
      { provide: ViewController, useFactory: () => ViewControllerMock.instance() }
    ])
      .then(compiled => {
        fixture = compiled.fixture;
        instance = compiled.instance;
      })
      .then(() => {
        params = { appointment: appointmentMock };
        const navParams = fixture.debugElement.injector.get(NavParams);
        navParams.data = { params };
        instance.ngOnInit();
        fixture.detectChanges();
      })
  ));

  it('should create the component', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have all texts', () => {
    expect(fixture.nativeElement.textContent)
      .toContain('How will I get paid?');
    expect(fixture.nativeElement.textContent)
      .toContain(
        'We will charge their credit card and will send you the payment (minus credit card fees)'
      );
    expect(fixture.nativeElement.textContent)
      .toContain('Total Charge');
    expect(fixture.nativeElement.textContent)
      .toContain(appointmentMock.grand_total);
    expect(fixture.nativeElement.textContent)
      .toContain('Credit Card Fees');
    expect(fixture.nativeElement.textContent)
      .toContain(appointmentMock.total_card_fee);
    expect(fixture.nativeElement.textContent)
      .toContain('You Earn');
    expect(fixture.nativeElement.textContent)
      .toContain(appointmentMock.grand_total - appointmentMock.total_card_fee);
    expect(fixture.nativeElement.textContent)
      .toContain('Payment Options');
  });

  it('should connect Stripe payout', async done => {
    const api = fixture.debugElement.injector.get(IntegrationsApi);
    const stripe = fixture.debugElement.injector.get(StripeOAuthService);

    const integrationRequestParams: AddIntegrationRequest = {
      server_auth_code: faker.random.uuid(),
      integration_type: IntegrationTypes.stripe_connect
    };

    spyOn(api, 'addIntegration').and.returnValue(of({}));
    spyOn(stripe, 'auth').and.returnValue(Promise.resolve(integrationRequestParams.server_auth_code));

    expect(appointmentMock.can_checkout_with_made)
      .toBeFalsy();

    await instance.onConnectPayout();

    expect(stripe.auth)
      .toHaveBeenCalledWith(appointmentMock.stripe_connect_client_id);
    expect(api.addIntegration)
      .toHaveBeenCalledWith(integrationRequestParams);
    expect(appointmentMock.can_checkout_with_made)
      .toBeTruthy();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain('Payout Method');
    expect(fixture.nativeElement.textContent)
      .toContain('Stripe');

    done();
  });
});
