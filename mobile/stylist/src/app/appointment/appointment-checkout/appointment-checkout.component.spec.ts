import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '../../../test';
import { AppointmentCheckoutComponent } from './appointment-checkout.component';
import { HomeService } from '~/core/api/home.service';
import { HomeServiceMock } from '~/core/api/home.service.mock';
import { AppointmentPreviewRequest } from '~/shared/api/appointments.models';
import { Haptic, NavParams } from 'ionic-angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';

let fixture: ComponentFixture<AppointmentCheckoutComponent>;
let instance: AppointmentCheckoutComponent;

describe('Pages: AppointmentCheckoutComponent', () => {
  prepareSharedObjectsForTests();
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler(
        [
          AppointmentCheckoutComponent
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

  // TODO: fix the test
  xit('appointment not checkedOut', async () => {
    const datePipe = fixture.debugElement.injector.get(DatePipe);
    const decimalPipe = fixture.debugElement.injector.get(DecimalPipe);
    const homeService = fixture.debugElement.injector.get(HomeService);
    const homeServiceMock = fixture.debugElement.injector.get(HomeServiceMock);
    const navParams = fixture.debugElement.injector.get(NavParams);
    navParams.data.params = {
      appointmentUuid: ''
    };
    instance.params = navParams.data.params;
    instance.ionViewWillEnter();

    spyOn(homeService, 'getAppointmentById').and.returnValue(
      homeServiceMock.getAppointmentById('')
    );

    instance.appointment = (await homeServiceMock.getAppointmentById('').get()).response;
    // Enable tax by default for new booked appointment if it's not `isAlreadyCheckedOut`
    instance.hasTaxIncluded = instance.appointment.has_tax_included;
    const appointmentPreview: AppointmentPreviewRequest = {
      appointment_uuid: '',
      datetime_start_at: instance.appointment.datetime_start_at,
      services: instance.appointment.services,
      has_tax_included: instance.hasTaxIncluded,
      has_card_fee_included: false
    };

    instance.previewResponse = (await homeServiceMock.getAppointmentPreview(appointmentPreview).get()).response;
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
    expect(appointmentPrice.innerText).toBe(instance.previewResponse.grand_total.toFixed());

    const appointmentServices = fixture.nativeElement.querySelectorAll('[data-test-id=appointmentServices]');
    expect(appointmentServices.length).toBe(instance.previewResponse.services.length);

    const appointmentTaxPercentage = fixture.nativeElement.querySelector('[data-test-id=appointmentTaxPercentage]');
    expect(appointmentTaxPercentage.innerText.replace(/\s/g, ''))
      .toContain(`TaxRate(${ decimalPipe.transform(instance.previewResponse.tax_percentage, '1.2')  }%)`);

    const appointmentAddServiceBtn = fixture.nativeElement.querySelector('[data-test-id=appointmentAddServiceBtn]');
    expect(appointmentAddServiceBtn).toBeDefined();

    const appointmentFinalizeCheckout = fixture.nativeElement.querySelector('[data-test-id=appointmentFinalizeCheckout]');
    expect(appointmentFinalizeCheckout).toBeDefined();
  });

  it('appointment checkedOut', async () => {
    const datePipe = fixture.debugElement.injector.get(DatePipe);
    const homeService = fixture.debugElement.injector.get(HomeService);
    const homeServiceMock = fixture.debugElement.injector.get(HomeServiceMock);
    const navParams = fixture.debugElement.injector.get(NavParams);
    navParams.data.params = {
      appointmentUuid: '',
      isAlreadyCheckedOut: true
    };
    instance.params = navParams.data.params;
    await instance.ionViewWillEnter();

    spyOn(homeService, 'getAppointmentById').and.returnValue(
      homeServiceMock.getAppointmentById('')
    );

    instance.appointment = (await homeServiceMock.getAppointmentById('').get()).response;
    // Enable tax by default for new booked appointment if it's not `isAlreadyCheckedOut`
    instance.hasTaxIncluded = false;
    const appointmentPreview: AppointmentPreviewRequest = {
      appointment_uuid: '',
      datetime_start_at: instance.appointment.datetime_start_at,
      services: instance.appointment.services,
      has_tax_included: instance.hasTaxIncluded,
      has_card_fee_included: false
    };

    instance.previewResponse = (await homeServiceMock.getAppointmentPreview(appointmentPreview).get()).response;
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
    expect(appointmentPrice.innerText).toBe(instance.previewResponse.grand_total.toFixed());

    const appointmentServices = fixture.nativeElement.querySelectorAll('[data-test-id=appointmentServices]');
    expect(appointmentServices.length).toBe(instance.previewResponse.services.length);

    const appointmentTaxPercentage = fixture.nativeElement.querySelector('[data-test-id=appointmentTaxPercentage]');
    expect(appointmentTaxPercentage)
      .toBeNull();

    const appointmentCardFeePercentage = fixture.nativeElement.querySelector('[data-test-id=appointmentCardFeePercentage]');
    expect(appointmentCardFeePercentage)
      .toBeNull();

    const appointmentAddServiceBtn = fixture.nativeElement.querySelector('[data-test-id=appointmentAddServiceBtn]');
    expect(appointmentAddServiceBtn).toBeNull();

    const appointmentFinalizeCheckout = fixture.nativeElement.querySelector('[data-test-id=appointmentFinalizeCheckout]');
    expect(appointmentFinalizeCheckout).toBeNull();
  });
});
