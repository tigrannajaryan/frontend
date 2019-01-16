import { async, ComponentFixture } from '@angular/core/testing';
import { NavParams } from 'ionic-angular';
import * as faker from 'faker';
import * as moment from 'moment';

import {
  AppointmentPreviewResponse,
  AppointmentStatus,
  StylistAppointmentModel
} from '~/shared/api/appointments.models';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

import { TestUtils } from '~/../test';
import { AppointmentPriceComponent, AppointmentPriceComponentParams } from './appointment-price.component';

let fixture: ComponentFixture<AppointmentPriceComponent>;
let instance: AppointmentPriceComponent;

const servicesMock = [
  {
    service_uuid: faker.random.uuid(),
    service_name: faker.commerce.productName(),
    client_price: 100,
    regular_price: 200,
    is_original: false
  },
  {
    service_uuid: faker.random.uuid(),
    service_name: faker.commerce.productName(),
    client_price: 300,
    regular_price: 400,
    is_original: false
  }
];

const appointmentMock: StylistAppointmentModel = {
  uuid: faker.random.uuid(),
  created_at: moment().format(),
  datetime_start_at: moment().format(),
  duration_minutes: 0,
  status: AppointmentStatus.new,
  services: servicesMock,
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
  client_profile_photo_url: faker.image.imageUrl()
};

const previewMock: AppointmentPreviewResponse = {
  duration_minutes: faker.random.number(),
  grand_total: faker.random.number(),
  total_client_price_before_tax: faker.random.number(),
  total_tax: faker.random.number(),
  total_card_fee: faker.random.number(),
  total_discount_amount: faker.random.number(),
  total_discount_percentage: faker.random.number(),
  tax_percentage: faker.random.number(),
  card_fee_percentage: faker.random.number(),
  services: servicesMock
};

describe('Pages: Appointment Price', () => {

  prepareSharedObjectsForTests();

  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler(
        [AppointmentPriceComponent]
      )
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
        .then(() => {
          const navParams = fixture.debugElement.injector.get(NavParams);
          const params: AppointmentPriceComponentParams = {
            appointment: appointmentMock
          };
          navParams.data = { params };
          instance.ionViewWillEnter();
          instance.preview = previewMock;
          fixture.detectChanges();
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should show title', () => {
    expect(fixture.nativeElement.textContent)
      .toContain('Change Price');
  });

  it('should list services', () => {
    const services = fixture.nativeElement.querySelector('[data-test-id=services]');

    expect(services)
      .toBeTruthy();

    for (const service of servicesMock) {
      expect(services.textContent)
        .toContain(service.service_name);
    }
  });

  it('should show reason to change price input', () => {
    const reason = fixture.nativeElement.querySelector('[data-test-id=reason] input');

    expect(reason)
      .toBeTruthy();
    expect(reason.placeholder)
      .toBe('Reason for Change (optional)');
  });

  it('should show price', () => {
    const price = fixture.nativeElement.querySelector('[data-test-id=price]');

    expect(price)
      .toBeTruthy();
    expect(price.textContent)
      .toContain('New Price');
    expect(price.textContent)
      .toContain(previewMock.grand_total.toFixed());
  });

  it('should show discount', () => {
    const discount = fixture.nativeElement.querySelector('[data-test-id=discount]');

    expect(discount)
      .toBeTruthy();

    expect(discount.textContent)
      .toContain(previewMock.total_discount_percentage);
    expect(discount.textContent)
      .toContain('Discount Applied');
  });

  xit('should update appointment on submit', () => {
    // const api = fixture.debugElement.injector.get(HomeService);
    // spyOn(api, 'changeAppointment').and.returnValue(of({}));

    // const fakeReason = faker.random.words;
    // const value = {};

    // for (const service of servicesMock) {
    //   value[service.service_uuid] = String(service.client_price - 10);
    // }

    // instance.form.patchValue(value);
    // instance.priceChangeReason.patchValue(fakeReason);

    // instance.onSave();

    // expect(api.changeAppointment)
    //   .toHaveBeenCalledWith(
    //     appointmentMock.uuid,
    //     {
    //       services: servicesMock.map(service => ({
    //         service_uuid: service.service_uuid,
    //         client_price: service.client_price - 10
    //       })),
    //       price_change_reason: fakeReason
    //     }
    //   );
  });
});
