import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture } from '@angular/core/testing';
import { Haptic, NavParams } from 'ionic-angular';
import { of } from 'rxjs/observable/of';
import * as faker from 'faker';

import { AppointmentStatus } from '~/shared/api/appointments.models';
import { HomeService } from '~/core/api/home.service';
import { HomeServiceMock } from '~/core/api/home.service.mock';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

import { TestUtils } from '../../../test';
import { AppointmentCheckoutComponent } from './appointment-checkout.component';
import { SettingsPaymentComponent } from '~/settings/settings-payment/settings-payment.component';

let fixture: ComponentFixture<AppointmentCheckoutComponent>;
let instance: AppointmentCheckoutComponent;

describe('Pages: AppointmentCheckoutComponent', () => {
  prepareSharedObjectsForTests();
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler(
        [
          AppointmentCheckoutComponent,
          SettingsPaymentComponent
        ],
        [
          HomeService,
          HomeServiceMock,
          HttpClientTestingModule,
          HttpClient,
          HttpHandler,
          Haptic,
          DatePipe,
          DecimalPipe
        ]
      )
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
    )
  );

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

  it('appointment not checkedOut', async () => {
    const datePipe = fixture.debugElement.injector.get(DatePipe);
    const decimalPipe = fixture.debugElement.injector.get(DecimalPipe);
    const homeService = fixture.debugElement.injector.get(HomeService);
    const homeServiceMock = fixture.debugElement.injector.get(HomeServiceMock);
    const navParams = fixture.debugElement.injector.get(NavParams);

    navParams.data.params = { appointmentUuid: faker.random.uuid() };

    const appointmentMock = (await homeServiceMock.getAppointmentById('').get()).response;
    appointmentMock.status = AppointmentStatus.new;

    spyOn(homeService, 'getAppointmentById').and.returnValue(
      of({ response: appointmentMock })
    );

    await instance.ionViewWillEnter();
    fixture.detectChanges();

    const appointmentTitle = fixture.nativeElement.querySelector('[data-test-id=appointmentTitle]');
    expect(appointmentTitle.innerText).toBe('Total Price');

    const appointmentDateTime = fixture.nativeElement.querySelector('[data-test-id=appointmentDateTime]');
    const appointmentDateTimeText = datePipe.transform(instance.appointment.datetime_start_at, 'h:mmaaaaa') +
      datePipe.transform(instance.appointment.datetime_start_at, ' E, MMM d');
    expect(appointmentDateTime.innerText).toBe(appointmentDateTimeText);

    const userFullName = fixture.nativeElement.querySelector('[data-test-id=userFullName]');
    expect(userFullName.innerText.replace(/\s/g, ''))
      .toBe(instance.appointment.client_first_name + instance.appointment.client_last_name);

    const appointmentPrice = fixture.nativeElement.querySelector('[data-test-id=appointmentPrice]');
    expect(appointmentPrice.innerText).toBe(instance.appointment.grand_total.toFixed());

    const appointmentServices = fixture.nativeElement.querySelectorAll('[data-test-id=appointmentServices]');
    expect(appointmentServices.length).toBe(instance.appointment.services.length);

    const appointmentTaxPercentage = fixture.nativeElement.querySelector('[data-test-id=appointmentTaxPercentage]');
    expect(appointmentTaxPercentage.innerText.replace(/\s/g, ''))
      .toContain(`TaxRate(${ decimalPipe.transform(instance.appointment.tax_percentage, '1.1-3')  }%)`);

    const appointmentAddServiceBtn = fixture.nativeElement.querySelector('[data-test-id=appointmentAddServiceBtn]');
    expect(appointmentAddServiceBtn).toBeDefined();

    const appointmentFinalizeCheckout = fixture.nativeElement.querySelector('[data-test-id=appointmentFinalizeCheckout]');
    expect(appointmentFinalizeCheckout).toBeDefined();
  });

  it('appointment checkedOut', async () => {
    const datePipe = fixture.debugElement.injector.get(DatePipe);
    const decimalPipe = fixture.debugElement.injector.get(DecimalPipe);
    const homeService = fixture.debugElement.injector.get(HomeService);
    const homeServiceMock = fixture.debugElement.injector.get(HomeServiceMock);
    const navParams = fixture.debugElement.injector.get(NavParams);

    navParams.data.params = { appointmentUuid: faker.random.uuid() };

    const appointmentMock = (await homeServiceMock.getAppointmentById('').get()).response;
    appointmentMock.status = AppointmentStatus.checked_out;

    spyOn(homeService, 'getAppointmentById').and.returnValue(
      of({ response: appointmentMock })
    );

    await instance.ionViewWillEnter();
    fixture.detectChanges();

    const appointmentTitle = fixture.nativeElement.querySelector('[data-test-id=appointmentTitle]');
    expect(appointmentTitle.innerText).toBe('Final Price');

    const appointmentDateTime = fixture.nativeElement.querySelector('[data-test-id=appointmentDateTime]');
    const appointmentDateTimeText = datePipe.transform(instance.appointment.datetime_start_at, 'h:mmaaaaa') +
      datePipe.transform(instance.appointment.datetime_start_at, ' E, MMM d');
    expect(appointmentDateTime.innerText).toBe(appointmentDateTimeText);

    const userFullName = fixture.nativeElement.querySelector('[data-test-id=userFullName]');
    expect(userFullName.innerText.replace(/\s/g, ''))
      .toBe(instance.appointment.client_first_name + instance.appointment.client_last_name);

    const appointmentPrice = fixture.nativeElement.querySelector('[data-test-id=appointmentPrice]');
    expect(appointmentPrice.innerText).toBe(instance.appointment.grand_total.toFixed());

    const appointmentServices = fixture.nativeElement.querySelectorAll('[data-test-id=appointmentServices]');
    expect(appointmentServices.length).toBe(instance.appointment.services.length);

    const appointmentTaxPercentage = fixture.nativeElement.querySelector('[data-test-id=appointmentTaxPercentage]');
    expect(appointmentTaxPercentage.innerText.replace(/\s/g, ''))
      .toContain(`TaxRate(${ decimalPipe.transform(instance.appointment.tax_percentage, '1.1-3')  }%)`);

    const appointmentCardFeePercentage = fixture.nativeElement.querySelector('[data-test-id=appointmentCardFeePercentage]');
    expect(appointmentCardFeePercentage)
      .toBeNull();

    const appointmentAddServiceBtn = fixture.nativeElement.querySelector('[data-test-id=appointmentAddServiceBtn]');
    expect(appointmentAddServiceBtn).toBeNull();

    const appointmentFinalizeCheckout = fixture.nativeElement.querySelector('[data-test-id=appointmentFinalizeCheckout]');
    expect(appointmentFinalizeCheckout).toBeNull();
  });
});
