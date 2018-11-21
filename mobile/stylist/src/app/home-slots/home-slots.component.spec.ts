import { async, ComponentFixture } from '@angular/core/testing';
import { ActionSheetButton } from 'ionic-angular/components/action-sheet/action-sheet-options';
import * as faker from 'faker';
import * as moment from 'moment';

import { getPhoneNumber } from '~/shared/utils/phone-numbers';

import { Appointment, AppointmentStatuses } from '~/core/api/home.models';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

import { TestUtils } from '../../test';
import { AppointmentsDataStore } from './appointments.data';
import { HomeSlotsComponent } from './home-slots.component';
import { createAppointment } from './time-slots/time-slots.component.spec';

// let fixture: ComponentFixture<HomeSlotsComponent>;
let instance: HomeSlotsComponent;

interface ActionSheetButtonNoHandler extends ActionSheetButton {
  // Make handler optional to use Jasmine’s deep equal:
  handler?: ActionSheetButton['handler'];
}

function removeHandlers(buttons: ActionSheetButton[]): ActionSheetButtonNoHandler[] {
  return buttons.map((button: ActionSheetButton) => {
    const { handler, ...otherOptions } = button;
    // Omit handler function to use Jasmine’s deep equal:
    return { ...otherOptions };
  });
}

describe('Pages: HomeSlotsComponent', () => {

  prepareSharedObjectsForTests();

  beforeEach(async(() =>
    TestUtils.beforeEachCompiler([HomeSlotsComponent], [AppointmentsDataStore])
      .then(compiled => {
        // fixture = compiled.fixture;
        instance = compiled.instance;
      })
  ));

  it('should create the page', () => {
    expect(instance).toBeTruthy();
  });

  it('should add proper buttons to appointments', () => {
    const startOfToday = moment().startOf('day').format();

    let appointment: Appointment;
    let buttons: ActionSheetButton[];

    // Use private method getAppointmentActionSheetOptions publicly:
    const getAppointmentActionSheetOptions =
      (instance as any).getAppointmentActionSheetOptions.bind(instance);

    // For today
    instance.selectedDate = moment().endOf('day');

    // New appointment
    appointment = createAppointment();
    appointment.datetime_start_at = startOfToday;
    appointment.status = AppointmentStatuses.new;
    buttons = removeHandlers(
      getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        { text: 'Check Out' },
        { text: 'No Show' },
        { text: `Call: ${getPhoneNumber(appointment.client_phone)}`},
        { text: `Copy: ${getPhoneNumber(appointment.client_phone)}`},
        { text: 'Cancel Appointment', role: 'destructive' },
        { text: 'Back', role: 'cancel' }
      ]);

    // New appointment without phone number
    appointment = createAppointment();
    appointment.datetime_start_at = startOfToday;
    appointment.status = AppointmentStatuses.new;
    appointment.client_phone = '';
    buttons = removeHandlers(
      getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        { text: 'Check Out' },
        { text: 'No Show' },
        // Call and copy unavailable in this case
        // { text: `Call: ${getPhoneNumber(appointment.client_phone)}`},
        // { text: `Copy: ${getPhoneNumber(appointment.client_phone)}`},
        { text: 'Cancel Appointment', role: 'destructive' },
        { text: 'Back', role: 'cancel' }
      ]);

    // No Show appointment
    appointment = createAppointment();
    appointment.datetime_start_at = startOfToday;
    appointment.status = AppointmentStatuses.no_show;
    buttons = removeHandlers(
      getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        { text: 'Check Out' },
        // 'No Show' removed in this case
        // { text: 'No Show' },
        { text: `Call: ${getPhoneNumber(appointment.client_phone)}`},
        { text: `Copy: ${getPhoneNumber(appointment.client_phone)}`},
        { text: 'Cancel Appointment', role: 'destructive' },
        { text: 'Back', role: 'cancel' }
      ]);

    // Canceled by client appointment
    appointment = createAppointment();
    appointment.datetime_start_at = startOfToday;
    appointment.status = AppointmentStatuses.cancelled_by_client;
    buttons = removeHandlers(
      getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        // 'Check Out' removed in this case
        // { text: 'Check Out' },
        { text: 'No Show' },
        { text: `Call: ${getPhoneNumber(appointment.client_phone)}`},
        { text: `Copy: ${getPhoneNumber(appointment.client_phone)}`},
        // 'Cancel Appointment' replaced with 'Delete Appointment' in this case
        { text: 'Delete Appointment', role: 'destructive' },
        { text: 'Back', role: 'cancel' }
      ]);

    // Checked out appointment
    appointment = createAppointment();
    appointment.datetime_start_at = startOfToday;
    appointment.status = AppointmentStatuses.checked_out;
    buttons = removeHandlers(
      getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        // 'Check Out' replaced with 'Details' in this case
        { text: 'Details' },
        { text: 'No Show' },
        { text: `Call: ${getPhoneNumber(appointment.client_phone)}`},
        { text: `Copy: ${getPhoneNumber(appointment.client_phone)}`},
        { text: 'Cancel Appointment', role: 'destructive' },
        { text: 'Back', role: 'cancel' }
      ]);

    // Blocked slot
    appointment = createAppointment();
    appointment.status = AppointmentStatuses.new;
    appointment.client_uuid = undefined;
    appointment.client_first_name = '';
    appointment.client_last_name = '';
    appointment.client_phone = '';
    buttons = removeHandlers(
      getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        { text: 'Unblock Slot' },
        { text: 'Back', role: 'cancel' }
      ]);

    // For tomorrow
    instance.selectedDate = moment().add(1, 'day').startOf('day');

    // New appointment
    appointment = createAppointment();
    appointment.datetime_start_at = moment().add(1, 'day').format();
    appointment.status = AppointmentStatuses.new;
    buttons = removeHandlers(
      getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        { text: 'Check Out' },
        // 'No Show' removed in this case
        // { text: 'No Show' },
        { text: `Call: ${getPhoneNumber(appointment.client_phone)}`},
        { text: `Copy: ${getPhoneNumber(appointment.client_phone)}`},
        { text: 'Cancel Appointment', role: 'destructive' },
        { text: 'Back', role: 'cancel' }
      ]);
  });
});
