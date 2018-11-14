import { TestBed } from '@angular/core/testing';
import * as faker from 'faker';

import { prepareSharedObjectsForTests } from '../../core/test-utils.spec';
import { Appointment, AppointmentStatuses, AppointmentService } from '../../core/api/home.models';
import { TimeSlotsComponent } from './time-slots.component';
import moment = require('moment');

function createAppointment(): Appointment {
  return {
    uuid: faker.random.uuid(),
    client_uuid: faker.random.uuid(),
    client_first_name: faker.name.firstName(),
    client_last_name: faker.name.lastName(),
    client_profile_photo_url: undefined,
    client_phone: faker.phone.phoneNumber(),
    total_client_price_before_tax: Math.random() * 200,
    total_card_fee: Math.random() * 5,
    total_tax: Math.random() * 15,
    grand_total: 9,
    created_at: faker.date.past().toString(),
    datetime_start_at: faker.date.future().toString(),
    duration_minutes: 0,
    status: AppointmentStatuses.new,
    has_card_fee_included: true,
    has_tax_included: true,
    services: Array(Math.round(Math.random()) + 1).fill(undefined).map(() => ({
      service_uuid: faker.random.uuid(),
      service_name: faker.commerce.product(),
      client_price: Math.random() * 50,
      regular_price: Math.random() * 50,
      is_original: Math.random() < 0.5
    }))
  };
}

function createService(): AppointmentService {
  return       {
    service_name: faker.commerce.product(),
    service_uuid: '',
    client_price: Math.random() * 50,
    regular_price: Math.random() * 50,
    is_original: true
  };
}

fdescribe('Pages: TimeSlotsComponent', () => {
  let fixture;
  let component: TimeSlotsComponent;

  prepareSharedObjectsForTests();

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSlotsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should formatClientName correctly', () => {
    const appointment: Appointment = createAppointment();

    appointment.client_first_name = 'Abc';
    appointment.client_last_name = '';
    appointment.client_phone = '';
    expect(component.formatClientName(appointment)).toEqual('Abc');

    appointment.client_first_name = '';
    appointment.client_last_name = 'Def';
    appointment.client_phone = '';
    expect(component.formatClientName(appointment)).toEqual('Def');

    appointment.client_first_name = 'Abc';
    appointment.client_last_name = 'Def';
    appointment.client_phone = '';
    expect(component.formatClientName(appointment)).toEqual('Abc Def');

    appointment.client_first_name = '';
    appointment.client_last_name = '';
    appointment.client_phone = '+12345';
    expect(component.formatClientName(appointment)).toEqual('+12345');

    appointment.client_first_name = 'Abc';
    appointment.client_last_name = 'Def';
    appointment.client_phone = '+1234';
    expect(component.formatClientName(appointment)).toEqual('Abc Def');
  });

  it('should formatServices correctly', () => {
    const appointment: Appointment = createAppointment();

    appointment.services = [];
    expect(component.formatServices(appointment)).toEqual('');

    const service = createService();
    service.service_name = 'abc';
    appointment.services = [service];
    expect(component.formatServices(appointment)).toEqual('abc');

    const service1 = createService();
    const service2 = createService();
    service1.service_name = 'abc';
    service2.service_name = 'defg';
    appointment.services = [service1, service2];
    expect(component.formatServices(appointment)).toEqual('abc, defg');
  });

  it('should appointmentEndMoment correctly', () => {
    const appointment: Appointment = createAppointment();

    appointment.datetime_start_at = '2018-11-02T09:00:00-04:00';
    appointment.duration_minutes = 30;
    expect(component.appointmentEndMoment(appointment).isSame(moment('2018-11-02T09:30:00-04:00'))).toBeTruthy();

    appointment.datetime_start_at = '2018-11-02T09:32:00+04:00';
    appointment.duration_minutes = 61;
    expect(component.appointmentEndMoment(appointment).isSame(moment('2018-11-02T10:33:00+04:00'))).toBeTruthy();
  });

  it('should isAppointmentPendingCheckout correctly', () => {
    const appointment: Appointment = createAppointment();

    appointment.datetime_start_at = '2018-11-02T09:00:00-04:00';
    appointment.duration_minutes = 30;
    appointment.status = AppointmentStatuses.new;
    expect(component.isAppointmentPendingCheckout(appointment)).toBeTruthy();

    appointment.datetime_start_at = '2018-11-02T09:00:00-04:00';
    appointment.duration_minutes = 30;
    appointment.status = AppointmentStatuses.checked_out;
    expect(component.isAppointmentPendingCheckout(appointment)).toBeFalsy();

    appointment.datetime_start_at = '3018-11-02T09:00:00-04:00';
    appointment.duration_minutes = 30;
    appointment.status = AppointmentStatuses.new;
    expect(component.isAppointmentPendingCheckout(appointment)).toBeFalsy();
  });
});
