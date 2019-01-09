import { async, ComponentFixture } from '@angular/core/testing';
import { NavParams } from 'ionic-angular';
import { of } from 'rxjs/observable/of';
import * as faker from 'faker';
import * as moment from 'moment';

import { TestUtils } from '~/../test';

import { AppointmentsApi } from '~/core/api/appointments.api';
import { AppointmentModel, AppointmentPreviewResponse, AppointmentStatus } from '~/core/api/appointments.models';

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

const appointmentMock: AppointmentModel = {
  uuid: faker.random.uuid(),
  stylist_uuid: faker.random.uuid(),
  stylist_first_name: faker.name.firstName(),
  stylist_last_name: faker.name.lastName(),
  stylist_photo_url: faker.image.imageUrl(),
  salon_name: faker.commerce.productName(),
  total_client_price_before_tax: faker.random.number(),
  total_card_fee: faker.random.number(),
  grand_total: faker.random.number(),
  total_tax: faker.random.number(),
  tax_percentage: faker.random.number(),
  card_fee_percentage: faker.random.number(),
  datetime_start_at: moment().format(),
  profile_photo_url: faker.image.imageUrl(),
  duration_minutes: 0,
  status: AppointmentStatus.new,
  services: servicesMock,
  has_tax_included: false,
  has_card_fee_included: false
};

const previewMock: AppointmentPreviewResponse = {
  duration_minutes: faker.random.number(),
  grand_total: faker.random.number(),
  total_client_price_before_tax: faker.random.number(),
  total_tax: faker.random.number(),
  total_card_fee: faker.random.number(),
  tax_percentage: faker.random.number(),
  card_fee_percentage: faker.random.number(),
  services: servicesMock
};

describe('Pages: Appointment Price', () => {

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

          instance.ngOnInit();
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
      .toContain((instance.preview || instance.appointment).grand_total.toFixed());
  });

  it('should show discount', () => {
    const discount = fixture.nativeElement.querySelector('[data-test-id=discount]');

    expect(discount)
      .toBeTruthy();

    let sum = 0;
    const saleAmount = servicesMock.reduce((amount, service) => {
      sum += service.regular_price;
      return amount + (service.regular_price - service.client_price);
    }, 0);

    expect(discount.textContent)
      .toContain(`${parseInt((saleAmount / sum * 100).toFixed(), 10)}%`);
    expect(discount.textContent)
      .toContain('Discount Applied');
  });

  it('should update appointment on submit', () => {
    const api = fixture.debugElement.injector.get(AppointmentsApi);
    spyOn(api, 'changeAppointment').and.returnValue(of({}));

    const fakeReason = faker.random.words;
    const value = {};

    for (const service of servicesMock) {
      value[service.service_uuid] = String(service.client_price - 10);
    }

    instance.form.patchValue(value);
    instance.priceChangeReason.patchValue(fakeReason);

    instance.onSave();

    expect(api.changeAppointment)
      .toHaveBeenCalledWith(
        appointmentMock.uuid,
        {
          services: servicesMock.map(service => ({
            service_uuid: service.service_uuid,
            client_price: service.client_price - 10
          })),
          price_change_reason: fakeReason
        }
      );
  });
});
