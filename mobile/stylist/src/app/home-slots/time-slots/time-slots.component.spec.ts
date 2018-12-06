import { TestBed } from '@angular/core/testing';
import * as faker from 'faker';
import * as moment from 'moment';

import { prepareSharedObjectsForTests } from '../../core/test-utils.spec';
import { Appointment, AppointmentService, AppointmentStatuses } from '../../core/api/home.models';
import { fullSlotWidthInVw, TimeSlotColumn, TimeSlotItem, TimeSlotLabel, TimeSlotsComponent } from './time-slots.component';
import {
  formatAppointmentClientName,
  formatAppointmentServices,
  getAppointmentEndMoment,
  isAppointmentPendingCheckout
} from '../time-slot-content/time-slot-content.component';

export function createAppointment(): Appointment {
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
  return {
    service_name: faker.commerce.product(),
    service_uuid: '',
    client_price: Math.random() * 50,
    regular_price: Math.random() * 50,
    is_original: true
  };
}

function isFullWidthSlot(slot: TimeSlotItem): boolean {
  return slot.column === TimeSlotColumn.both &&
    slot.leftInVw === 0 &&
    slot.widthInVw === fullSlotWidthInVw &&
    slot.heightInVw > 0;
}

function isFreeTimeSlot(slot: TimeSlotItem): boolean {
  return slot.appointment === undefined && isFullWidthSlot(slot);
}

function isLeftSlot(slot: TimeSlotItem): boolean {
  return slot.column === TimeSlotColumn.left &&
    slot.leftInVw === 0 &&
    slot.widthInVw === fullSlotWidthInVw / 2 &&
    slot.heightInVw > 0;
}

function isRightSlot(slot: TimeSlotItem): boolean {
  return slot.column === TimeSlotColumn.right &&
    slot.leftInVw === fullSlotWidthInVw / 2 &&
    slot.widthInVw === fullSlotWidthInVw / 2 &&
    slot.heightInVw > 0;
}

describe('TimeSlotsComponent', () => {
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
    expect(formatAppointmentClientName(appointment)).toEqual('Abc');

    appointment.client_first_name = '';
    appointment.client_last_name = 'Def';
    appointment.client_phone = '';
    expect(formatAppointmentClientName(appointment)).toEqual('Def');

    appointment.client_first_name = 'Abc';
    appointment.client_last_name = 'Def';
    appointment.client_phone = '';
    expect(formatAppointmentClientName(appointment)).toEqual('Abc Def');

    appointment.client_first_name = '';
    appointment.client_last_name = '';
    appointment.client_phone = '+12345';
    expect(formatAppointmentClientName(appointment)).toEqual('+12345');

    appointment.client_first_name = 'Abc';
    appointment.client_last_name = 'Def';
    appointment.client_phone = '+1234';
    expect(formatAppointmentClientName(appointment)).toEqual('Abc Def');
  });

  it('should formatServices correctly', () => {
    const appointment: Appointment = createAppointment();

    appointment.services = [];
    expect(formatAppointmentServices(appointment)).toEqual('');

    const service = createService();
    service.service_name = 'abc';
    appointment.services = [service];
    expect(formatAppointmentServices(appointment)).toEqual('abc');

    const service1 = createService();
    const service2 = createService();
    service1.service_name = 'abc';
    service2.service_name = 'defg';
    appointment.services = [service1, service2];
    expect(formatAppointmentServices(appointment)).toEqual('abc, defg');
  });

  it('should appointmentEndMoment correctly', () => {
    const appointment: Appointment = createAppointment();

    appointment.datetime_start_at = '2018-11-02T09:00:00-04:00';
    appointment.duration_minutes = 30;
    expect(getAppointmentEndMoment(appointment).isSame(moment('2018-11-02T09:30:00-04:00'))).toBeTruthy();

    appointment.datetime_start_at = '2018-11-02T09:32:00+04:00';
    appointment.duration_minutes = 61;
    expect(getAppointmentEndMoment(appointment).isSame(moment('2018-11-02T10:33:00+04:00'))).toBeTruthy();
  });

  it('should isAppointmentPendingCheckout correctly', () => {
    const appointment: Appointment = createAppointment();

    appointment.datetime_start_at = '2018-11-02T09:00:00-04:00';
    appointment.duration_minutes = 30;
    appointment.status = AppointmentStatuses.new;
    expect(isAppointmentPendingCheckout(appointment)).toBeTruthy();

    appointment.datetime_start_at = '2018-11-02T09:00:00-04:00';
    appointment.duration_minutes = 30;
    appointment.status = AppointmentStatuses.checked_out;
    expect(isAppointmentPendingCheckout(appointment)).toBeFalsy();

    appointment.datetime_start_at = '3018-11-02T09:00:00-04:00';
    appointment.duration_minutes = 30;
    appointment.status = AppointmentStatuses.new;
    expect(isAppointmentPendingCheckout(appointment)).toBeFalsy();
  });

  it('should create time axis', () => {
    expect(component.timeLabels.length).toEqual(25);

    const joc = jasmine.objectContaining;
    expect(component.timeLabels[0]).toEqual(joc<TimeSlotLabel>({ text: '' }));
    expect(component.timeLabels[1]).toEqual(joc<TimeSlotLabel>({ text: '1 AM' }));
    expect(component.timeLabels[23]).toEqual(joc<TimeSlotLabel>({ text: '11 PM' }));
    expect(component.timeLabels[24]).toEqual(joc<TimeSlotLabel>({ text: '' }));
  });

  it('should work for no appointments', () => {
    component.appointments = [];
    component.slotIntervalInMin = 30;
    expect(component.slotItems.length).toEqual(24 * 2);
    expect(component.slotItems.some(slot => !isFreeTimeSlot(slot))).toBeFalsy();

    component.appointments = [];
    component.slotIntervalInMin = 60;
    expect(component.slotItems.length).toEqual(24);
    expect(component.slotItems.some(slot => !isFreeTimeSlot(slot))).toBeFalsy();

    component.slotIntervalInMin = 45;
    expect(component.slotItems.length).toEqual(32);
    expect(component.slotItems.some(slot => !isFreeTimeSlot(slot))).toBeFalsy();
  });

  it('should work with one appointment', () => {
    const appointment = createAppointment();
    appointment.datetime_start_at = '2018-11-02T10:00:00-04:00';
    appointment.duration_minutes = 30;

    component.appointments = [appointment];
    component.slotIntervalInMin = 30;
    expect(component.slotItems.length).toEqual(24 * 2);
    expect(component.slotItems.filter(slot => isFreeTimeSlot(slot)).length).toEqual(24 * 2 - 1);

    const slot = component.slotItems[0];
    expect(isFreeTimeSlot(slot)).toBeFalsy();
    expect(isFullWidthSlot(slot)).toBeTruthy();
  });

  it('should work with two appointments with the same times', () => {
    const appointment1 = createAppointment();
    const appointment2 = createAppointment();
    appointment1.datetime_start_at = '2018-11-02T10:00:00-04:00';
    appointment1.duration_minutes = 30;
    appointment2.datetime_start_at = '2018-11-02T10:00:00-04:00';
    appointment2.duration_minutes = 30;

    component.appointments = [appointment1, appointment2];
    component.slotIntervalInMin = 30;
    expect(component.slotItems.length).toEqual(24 * 2 + 1);
    expect(component.slotItems.filter(slot => isFreeTimeSlot(slot)).length).toEqual(24 * 2 - 1);

    const slot1 = component.slotItems[0];
    expect(isFreeTimeSlot(slot1)).toBeFalsy();
    expect(isLeftSlot(slot1)).toBeTruthy();

    const slot2 = component.slotItems[1];
    expect(isFreeTimeSlot(slot2)).toBeFalsy();
    expect(isRightSlot(slot2)).toBeTruthy();
    expect(slot2.posYInVw).toEqual(slot1.posYInVw);
    expect(slot2.heightInVw).toEqual(slot1.heightInVw);
  });

  it('should work with two consecutive appointments', () => {
    const appointment1 = createAppointment();
    const appointment2 = createAppointment();
    appointment1.datetime_start_at = '2018-11-02T10:00:00-04:00';
    appointment1.duration_minutes = 30;
    appointment2.datetime_start_at = '2018-11-02T10:30:00-04:00';
    appointment2.duration_minutes = 30;

    component.appointments = [appointment1, appointment2];
    component.slotIntervalInMin = 30;
    expect(component.slotItems.length).toEqual(24 * 2);
    expect(component.slotItems.filter(slot => isFreeTimeSlot(slot)).length).toEqual(24 * 2 - 2);

    const slot1 = component.slotItems[0];
    expect(isFreeTimeSlot(slot1)).toBeFalsy();
    expect(isFullWidthSlot(slot1)).toBeTruthy();

    const slot2 = component.slotItems[1];
    expect(isFreeTimeSlot(slot2)).toBeFalsy();
    expect(isFullWidthSlot(slot2)).toBeTruthy();
    expect(slot2.posYInVw).toBeGreaterThan(slot1.posYInVw);
    expect(slot2.heightInVw).toEqual(slot1.heightInVw);
  });

  it('should work with two overlapping appointments', () => {
    const appointment1 = createAppointment();
    const appointment2 = createAppointment();
    appointment1.datetime_start_at = '2018-11-02T10:00:00-04:00';
    appointment1.duration_minutes = 30;
    appointment2.datetime_start_at = '2018-11-02T10:15:00-04:00';
    appointment2.duration_minutes = 30;

    component.appointments = [appointment1, appointment2];
    component.slotIntervalInMin = 30;
    expect(component.slotItems.length).toEqual(24 * 2);
    expect(component.slotItems.filter(slot => isFreeTimeSlot(slot)).length).toEqual(24 * 2 - 2);

    const slot1 = component.slotItems[0];
    expect(isFreeTimeSlot(slot1)).toBeFalsy();
    expect(isLeftSlot(slot1)).toBeTruthy();

    const slot2 = component.slotItems[1];
    expect(isFreeTimeSlot(slot2)).toBeFalsy();
    expect(isRightSlot(slot2)).toBeTruthy();
    expect(slot2.posYInVw).toBeGreaterThan(slot1.posYInVw);
    expect(slot2.heightInVw).toEqual(slot1.heightInVw);
  });

  it('should work with three overlapping appointments', () => {
    const appointment1 = createAppointment();
    const appointment2 = createAppointment();
    const appointment3 = createAppointment();
    appointment1.datetime_start_at = '2018-11-02T10:00:00-04:00';
    appointment1.duration_minutes = 30;
    appointment2.datetime_start_at = '2018-11-02T10:15:00-04:00';
    appointment2.duration_minutes = 30;
    appointment3.datetime_start_at = '2018-11-02T10:30:00-04:00';
    appointment3.duration_minutes = 30;

    component.appointments = [appointment1, appointment2, appointment3];
    component.slotIntervalInMin = 30;
    expect(component.slotItems.length).toEqual(24 * 2 + 1);
    expect(component.slotItems.filter(slot => isFreeTimeSlot(slot)).length).toEqual(24 * 2 - 2);

    const slot1 = component.slotItems[0];
    expect(isFreeTimeSlot(slot1)).toBeFalsy();
    expect(isLeftSlot(slot1)).toBeTruthy();

    const slot2 = component.slotItems[1];
    expect(isFreeTimeSlot(slot2)).toBeFalsy();
    expect(isRightSlot(slot2)).toBeTruthy();
    expect(slot2.posYInVw).toBeGreaterThan(slot1.posYInVw);
    expect(slot2.heightInVw).toEqual(slot1.heightInVw);

    const slot3 = component.slotItems[2];
    expect(isFreeTimeSlot(slot3)).toBeFalsy();
    expect(isLeftSlot(slot3)).toBeTruthy();
    expect(slot3.posYInVw).toBeGreaterThan(slot2.posYInVw);
    expect(slot3.heightInVw).toEqual(slot3.heightInVw);
  });

  it('should work with one long appointment', () => {
    const appointment1 = createAppointment();
    appointment1.datetime_start_at = '2018-11-02T10:00:00-04:00';
    appointment1.duration_minutes = 75;

    component.appointments = [appointment1];
    component.slotIntervalInMin = 30;
    expect(component.slotItems.length).toEqual(24 * 2 - 2);
    expect(component.slotItems.filter(slot => isFreeTimeSlot(slot)).length).toEqual(24 * 2 - 3);

    const slot1 = component.slotItems[0];
    expect(isFreeTimeSlot(slot1)).toBeFalsy();
    expect(isFullWidthSlot(slot1)).toBeTruthy();
  });

  it('should work with 60 min gap', () => {
    const appointment1 = createAppointment();
    appointment1.datetime_start_at = '2018-11-02T10:00:00-04:00';
    appointment1.duration_minutes = 60;

    component.appointments = [appointment1];
    component.slotIntervalInMin = 60;
    expect(component.slotItems.length).toEqual(24);
    expect(component.slotItems.filter(slot => isFreeTimeSlot(slot)).length).toEqual(24 - 1);

    const slot1 = component.slotItems[0];
    expect(isFreeTimeSlot(slot1)).toBeFalsy();
    expect(isFullWidthSlot(slot1)).toBeTruthy();
  });

  it('should work with 60 min gap and 3 appointments', () => {
    const appointment1 = createAppointment();
    const appointment2 = createAppointment();
    const appointment3 = createAppointment();
    appointment1.datetime_start_at = '2018-11-02T10:00:00-04:00';
    appointment1.duration_minutes = 60;
    appointment2.datetime_start_at = '2018-11-02T10:15:00-04:00';
    appointment2.duration_minutes = 65;
    appointment3.datetime_start_at = '2018-11-02T10:30:00-04:00';
    appointment3.duration_minutes = 91;

    component.appointments = [appointment1, appointment2, appointment3];
    component.slotIntervalInMin = 60;
    expect(component.slotItems.length).toEqual(24);
    expect(component.slotItems.filter(slot => isFreeTimeSlot(slot)).length).toEqual(24 - 3);

    const slot1 = component.slotItems[0];
    expect(isFreeTimeSlot(slot1)).toBeFalsy();
    expect(isLeftSlot(slot1)).toBeTruthy();

    const slot2 = component.slotItems[1];
    expect(isFreeTimeSlot(slot2)).toBeFalsy();
    expect(isRightSlot(slot2)).toBeTruthy();
    expect(slot2.posYInVw).toBeGreaterThan(slot1.posYInVw);
    expect(slot2.heightInVw).toBeGreaterThan(slot1.heightInVw);

    const slot3 = component.slotItems[2];
    expect(isFreeTimeSlot(slot3)).toBeFalsy();
    expect(isLeftSlot(slot3)).toBeTruthy();
    expect(slot3.posYInVw).toBeGreaterThan(slot2.posYInVw);
    expect(slot3.heightInVw).toBeGreaterThan(slot2.heightInVw);
  });

  it('should correctly set free time slots date', () => {
    const today = moment();
    const tomorrow = moment().add(1, 'day');
    component.selectedDate = tomorrow;
    expect(component.slotItems.every(slot => slot.startTime.isSame(tomorrow, 'day')))
      .toBeTruthy();
  });

  it('should cover all day with grey overlay when non-working day', () => {
    // tslint:disable-next-line
    component.startHour = null; // API returns work_start_at null for non-working day
    // tslint:disable-next-line
    component.endHour = null; // API returns work_end_at null for non-working day

    // Height of morning non-working hours equals full height:
    expect(component.timeAxis.morningNonWorkingInVw)
      .toEqual(component.timeAxis.heightInVw);

    // Position top of evening non-working hours equals full height (means it hidden):
    expect(component.timeAxis.eveningNonWorkingInVw)
      .toEqual(component.timeAxis.heightInVw);
  });
});
