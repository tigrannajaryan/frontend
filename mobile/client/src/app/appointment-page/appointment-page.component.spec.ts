import { async, ComponentFixture } from '@angular/core/testing';
import { NavController, NavParams } from 'ionic-angular';
import { of } from 'rxjs/observable/of';
import * as moment from 'moment';

import { TestUtils } from '~/../test';
import { AppointmentsApi } from '~/core/api/appointments.api';
import { appointmentMock } from '~/core/api/appointments.api.mock';
import {
  AppointmentAttribute,
  AppointmentPageComponent,
  AppointmentPageComponentParams
} from '~/appointment-page/appointment-page.component';
import { PageNames } from '~/core/page-names';
import { AppointmentPriceComponentParams } from '~/appointment-price/appointment-price.component';
import { AppointmentStatus } from '~/shared/api/appointments.models';
import * as faker from "faker";
import { AddServicesComponentParams } from '~/add-services/add-services.component';
import { confirmRebook, reUseAppointment } from '~/booking/booking-utils';
import { BookingApi, CreateAppointmentRequest } from '~/core/api/booking.api';
import { BookingData } from '~/core/api/booking.data';
import { offerMock, stylistsMock } from '~/core/api/stylists.service.mock';


let fixture: ComponentFixture<AppointmentPageComponent>;
let instance: AppointmentPageComponent;

describe('Pages: Appointment Page', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([AppointmentPageComponent], [AppointmentsApi])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
        .then(() => {
          const navParams = fixture.debugElement.injector.get(NavParams);
          const params: AppointmentPageComponentParams = {
            appointment: appointmentMock
          };
          navParams.data = { params };

          const appointmentsApi = fixture.debugElement.injector.get(AppointmentsApi);
          spyOn(appointmentsApi, 'getAppointment').and.returnValue(of({
            response: appointmentMock
          }));

          instance.ionViewWillEnter();
          fixture.detectChanges();
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('isTodayAppointment should working properly for today', () => {
    expect(instance.isTodayAppointment())
      .toBe(Boolean(moment(instance.params.appointment.datetime_start_at).diff(new Date()) < 0));
  });

  it('isTodayAppointment should working properly for future day', () => {
    // set date to tomorrow
    instance.params.appointment.datetime_start_at = moment(new Date()).add(1,'days').toString();

    // moment().diff() = compare now with datetime_start_at
    expect(instance.isTodayAppointment())
      .toBe(Boolean((moment().diff(instance.params.appointment.datetime_start_at) > 0)));
  });

  it('onChangePrice should working properly', () => {
    // it should have uuid
    instance.params.appointment.uuid = faker.random.uuid();
    // and to be not checked_out
    instance.params.appointment.status = AppointmentStatus.new;
    // and today
    instance.params.appointment.datetime_start_at = moment().format();

    fixture.detectChanges();

    const navCtrl = fixture.debugElement.injector.get(NavController);

    fixture.nativeElement.querySelector('[data-test-id=appointment_change_price]').click();

    const params: AppointmentPriceComponentParams = {
      appointment: instance.params.appointment
    };

    expect(navCtrl.push)
      .toHaveBeenCalledWith(PageNames.AppointmentPrice, { params });
  });

  it('onReUseAppointmentClick should working properly', () => {
    // it should have uuid
    instance.params.appointment.uuid = faker.random.uuid();
    // and status is new
    instance.params.appointment.status = AppointmentStatus.new;
    // and tomorrow
    instance.params.appointment.datetime_start_at = moment(new Date()).add(1,'days').format();
    // and we should have onCancel function in params
    instance.params.onCancel = () => {};

    fixture.detectChanges();

    const appointment_re_schedule = fixture.nativeElement.querySelector('[data-test-id=appointment_re_schedule]');
    expect(appointment_re_schedule).toBeDefined();
    appointment_re_schedule.click();

    const confirmRebook = jasmine.createSpy('confirmRebook');
    confirmRebook(instance.params.appointment);
    expect(confirmRebook)
      .toHaveBeenCalledWith(instance.params.appointment);

    const navCtrl = fixture.debugElement.injector.get(NavController);
    navCtrl.pop();
    expect(navCtrl.pop).toHaveBeenCalled();

    const reUseAppointment = jasmine.createSpy('reUseAppointment');
    reUseAppointment(instance.params.appointment, true);
    expect(reUseAppointment)
      .toHaveBeenCalledWith(instance.params.appointment, true);
  });

  it('hasAttribute should working properly for booking', () => {
    // booking
    instance.params.appointment.uuid = '';
    expect(instance.hasAttribute(AppointmentAttribute.booking))
      .toBeTruthy()
  });

  it('hasAttribute should working properly for rescheduling', () => {
    // rescheduling
    // it should have uuid
    instance.params.appointment.uuid = faker.random.uuid();
    // and to be not no_show
    instance.params.appointment.status = AppointmentStatus.new;
    // and we should have params isRescheduling
    instance.params.isRescheduling = true;
    expect(instance.hasAttribute(AppointmentAttribute.rescheduling))
      .toBeTruthy()
  });

  it('hasAttribute should working properly for checkout', () => {
    // checkout
    // it should have uuid
    instance.params.appointment.uuid = faker.random.uuid();
    // and to be not checked_out
    instance.params.appointment.status = AppointmentStatus.new;
    // and today
    instance.params.appointment.datetime_start_at = moment(new Date()).format();
    expect(instance.hasAttribute(AppointmentAttribute.checkout))
      .toBeTruthy()
  });

  it('hasAttribute should working properly for reBook', () => {
    // reBook
    // it should have uuid
    instance.params.appointment.uuid = faker.random.uuid();
    // and to be not no_show
    instance.params.appointment.status = AppointmentStatus.new;
    // and we should have params hasRebook
    instance.params.hasRebook = true;
    // and future day
    instance.params.appointment.datetime_start_at = moment(new Date()).add(1,'days').format();

    expect(instance.hasAttribute(AppointmentAttribute.reBook))
      .toBeTruthy()
  });

  it('hasAttribute should working properly for futureAppointment', () => {
    // futureAppointment
    // it should have uuid
    instance.params.appointment.uuid = faker.random.uuid();
    // and status should be new
    instance.params.appointment.status = AppointmentStatus.new;
    // and future day
    instance.params.appointment.datetime_start_at = moment(new Date()).add(1,'days').format();
    // and with onCancel callback
    instance.params.onCancel = () => {};

    expect(instance.hasAttribute(AppointmentAttribute.futureAppointment))
      .toBeTruthy()
  });

  it('hasAttribute should working properly for editAppointmentButtons', () => {
    // editAppointmentButtons
    // it should have uuid
    instance.params.appointment.uuid = faker.random.uuid();
    // and status should not checked_out
    instance.params.appointment.status = AppointmentStatus.new;
    // and today
    instance.params.appointment.datetime_start_at = moment().format();

    expect(instance.hasAttribute(AppointmentAttribute.editAppointmentButtons))
      .toBeTruthy()
  });

  it('hasAttribute should working properly for withRating', () => {
    // withRating
    // it should have uuid
    instance.params.appointment.uuid = faker.random.uuid();
    // and status should be checked_out
    instance.params.appointment.status = AppointmentStatus.checked_out;
    // and with rating
    instance.params.appointment.rating = 1;

    expect(instance.hasAttribute(AppointmentAttribute.withRating))
      .toBeTruthy()
  });

  it('hasAttribute should working properly for withoutRating', () => {
    // withoutRating
    // it should have uuid
    instance.params.appointment.uuid = faker.random.uuid();
    // and status should be checked_out
    instance.params.appointment.status = AppointmentStatus.checked_out;
    // and without rating
    instance.params.appointment.rating = null;
    // and without comment
    instance.params.appointment.comment = null;

    expect(instance.hasAttribute(AppointmentAttribute.withoutRating))
      .toBeTruthy()
  });

  it('hasAttribute should working properly for withComment', () => {
    // withComment
    // it should have uuid
    instance.params.appointment.uuid = faker.random.uuid();
    // and status should be checked_out
    instance.params.appointment.status = AppointmentStatus.checked_out;
    // and with comment
    instance.params.appointment.comment = faker.lorem.paragraph();

    expect(instance.hasAttribute(AppointmentAttribute.withComment))
      .toBeTruthy()
  });
});
