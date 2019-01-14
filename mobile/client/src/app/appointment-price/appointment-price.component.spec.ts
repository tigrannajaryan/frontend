import { async, ComponentFixture } from '@angular/core/testing';
import { NavParams } from 'ionic-angular';
import { of } from 'rxjs/observable/of';
import * as faker from 'faker';
import * as moment from 'moment';

import { TestUtils } from '~/../test';
import { AppointmentStatus, ClientAppointmentModel } from '~/shared/api/appointments.models';
import { AppointmentsApi } from '~/core/api/appointments.api';
import { previewMock, servicesMock } from '~/core/api/appointments.api.mock';

import { AppointmentPriceComponent, AppointmentPriceComponentParams } from './appointment-price.component';

const appointmentMock: ClientAppointmentModel = {
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
  // Stylist
  stylist_uuid: faker.random.uuid(),
  stylist_first_name: faker.name.firstName(),
  stylist_last_name: faker.name.lastName(),
  stylist_photo_url: faker.image.imageUrl(),
  profile_photo_url: faker.image.imageUrl(),
  salon_name: faker.commerce.productName()
};

let fixture: ComponentFixture<AppointmentPriceComponent>;
let instance: AppointmentPriceComponent;

describe('Pages: Appointment Price', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([AppointmentPriceComponent])
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
          fixture.detectChanges();
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have title', () => {
    expect(fixture.nativeElement.textContent)
      .toContain('Change Price');
  });

  it('should list changeable services', () => {
    instance.preview = previewMock;
    fixture.detectChanges();

    const servicesContainer = fixture.nativeElement.querySelector('[data-test-id=services]');

    for (const service of servicesMock) {
      expect(servicesContainer.textContent)
        .toContain(service.service_name);
    }
  });

  it('should have price change reason', () => {
    const priceChangeInput = fixture.nativeElement.querySelector('[data-test-id=reason] input');

    expect(priceChangeInput)
      .toBeTruthy();
    expect(priceChangeInput.placeholder)
      .toBe('Reason for Change (optional)');
  });

  it('should show new price when some service’s price is changed', () => {
    instance.preview = previewMock;
    fixture.detectChanges();

    const priceContainer = fixture.nativeElement.querySelector('[data-test-id=price]');

    expect(priceContainer.textContent)
      .toContain('New Price');
    expect(priceContainer.textContent)
      .toContain(previewMock.grand_total.toFixed());
  });

  it('should have disabled update btn when prices not changed', () => {
    const continueBtn = fixture.nativeElement.querySelector('[data-test-id=continueBtn]');

    expect(continueBtn.disabled)
      .toBeTruthy();

    instance.changedServices = servicesMock;
    fixture.detectChanges();

    expect(continueBtn.disabled)
      .toBeFalsy();
  });

  it('should update existing appointment', () => {
    const api = fixture.debugElement.injector.get(AppointmentsApi);

    const changedService = {
      ...servicesMock[0],
      client_price: 50
    };

    instance.changedServices = [changedService];
    fixture.detectChanges();

    spyOn(api, 'changeAppointment').and.returnValue(of({
      response: appointmentMock
    }));

    fixture.nativeElement.querySelector('[data-test-id=continueBtn]').click();

    expect(api.changeAppointment)
      .toHaveBeenCalledWith(
        appointmentMock.uuid,
        {
          services: [changedService, servicesMock[1]],
          price_change_reason: ''
        }
      );
  });

  it('should alter new appointment', () => {
    instance.appointment.uuid = undefined; // new appointment
    instance.preview = previewMock;

    instance.onSave();

    expect(instance.appointment)
      .toEqual({
        ...appointmentMock,
        grand_total: previewMock.grand_total,
        total_client_price_before_tax: previewMock.total_client_price_before_tax,
        total_tax: previewMock.total_tax,
        total_card_fee: previewMock.total_card_fee,
        tax_percentage: previewMock.tax_percentage,
        card_fee_percentage: previewMock.card_fee_percentage,
        services: previewMock.services
      });
  });
});
