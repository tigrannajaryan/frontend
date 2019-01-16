import { async, ComponentFixture } from '@angular/core/testing';
import { NavParams } from 'ionic-angular';
import { of } from 'rxjs/observable/of';

import { TestUtils } from '~/../test';
import { AppointmentsApi } from '~/core/api/appointments.api';
import { appointmentMock, previewMock, servicesMock } from '~/core/api/appointments.api.mock';

import { AppointmentPriceComponent, AppointmentPriceComponentParams } from './appointment-price.component';

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
      regular_price: 50
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
          services: [{
            service_uuid: changedService.service_uuid,
            client_price: changedService.regular_price
          },
          {
            service_uuid: servicesMock[1].service_uuid,
            client_price: undefined
          }],
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
