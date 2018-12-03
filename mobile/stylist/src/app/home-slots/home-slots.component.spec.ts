import { async, ComponentFixture } from '@angular/core/testing';
import { ActionSheetButton } from 'ionic-angular/components/action-sheet/action-sheet-options';
import { DatePicker } from '@ionic-native/date-picker';
import * as moment from 'moment';

import { getPhoneNumber } from '../shared/utils/phone-numbers';
import { WeekdayIso } from '../shared/weekday';

import { Appointment, AppointmentStatuses } from '../core/api/home.models';
import { prepareSharedObjectsForTests } from '../core/test-utils.spec';

import { TestUtils } from '../../test';
import { AppointmentsDataStore } from './appointments.data';
import { ProfileDataStore } from '../core/profile.data';
import { HomeSlotsComponent } from './home-slots.component';
import { createAppointment } from './time-slots/time-slots.component.spec';
import { ModalController, ViewController } from 'ionic-angular';
import { PageNames } from '~/core/page-names';

let fixture: ComponentFixture<HomeSlotsComponent>;
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
    TestUtils.beforeEachCompiler(
      [HomeSlotsComponent],
      [
        AppointmentsDataStore,
        ProfileDataStore,
        ModalController
      ]
    )
      .then(compiled => {
        fixture = compiled.fixture;
        instance = compiled.instance;
      })
  ));

  it('should create the page', () => {
    expect(instance).toBeTruthy();
  });

  it('should select date on month name click', () => {
    const datePicker = fixture.debugElement.injector.get(DatePicker);

    fixture.nativeElement.querySelector('[data-test-id=selectDate]').click();

    expect(datePicker.show)
      .toHaveBeenCalledWith({
        date: instance.selectedDate.toDate(),
        mode: 'date',
        androidTheme: datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
      });
  });

  it('should show weekdays selector', () => {
    const today = moment();
    const startOfWeek = moment(today).startOf('week');
    const disabled = { isoWeekday: WeekdayIso.Fri }; // TGI Friday

    instance.selectedDate = today;
    instance.disabledWeekdays = [disabled];

    fixture.detectChanges();

    let disabledDate: moment.Moment;

    // Check all weekdays present:
    for (let i = WeekdayIso.Mon; i <= WeekdayIso.Sun; i++) {
      const date = moment(startOfWeek).add(i - 1, 'days');

      expect(fixture.nativeElement.textContent)
        .toContain(date.format('ddd'));
      expect(fixture.nativeElement.textContent)
        .toContain(date.format('D'));

      if (date.isoWeekday() === disabled.isoWeekday) {
        disabledDate = date;
      }
    }

    // WARNING: template-dependant selector
    const disabledEl: HTMLElement = fixture.nativeElement.querySelector('.HCalendar-date.is-disabled');

    // Check Friday is disabled:
    expect(disabledEl)
      .toBeTruthy();
    expect(disabledEl.textContent)
      .toContain(disabledDate.format('ddd'));
    expect(disabledEl.textContent)
      .toContain(disabledDate.format('D'));

    // WARNING: template-dependant selector
    const selected: HTMLElement = fixture.nativeElement.querySelector('.HCalendar-date.is-selected');

    // Check selected day is selected:
    expect(selected)
      .toBeTruthy();
    expect(selected.textContent)
      .toContain(today.format('ddd'));
    expect(selected.textContent)
      .toContain(today.format('D'));
  });

  it('should show fully blocked day', () => {
    instance.selectedDate = moment(); // today
    instance.isFullyBlocked = true;

    const buttons: ActionSheetButton[] = removeHandlers(
      instance.getBlockedDayActionSheetOptions()
    );

    expect(buttons)
      .toEqual([
        { text: 'Unblock Day', role: 'destructive' },
        { text: 'Back', role: 'cancel' }
      ]);
  });

  it('should add proper buttons to appointments', async () => {
    const startOfToday = moment().startOf('day').format();

    let appointment: Appointment;
    let buttons: ActionSheetButton[];

    // For today
    instance.selectedDate = moment();

    // New appointment
    appointment = createAppointment();
    appointment.datetime_start_at = startOfToday;
    appointment.status = AppointmentStatuses.new;
    buttons = removeHandlers(
      await instance.getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        { text: 'View and Check Out' },
        { text: 'No Show' },
        { text: 'Add to Google Calendar' },
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
      await instance.getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        { text: 'View and Check Out' },
        { text: 'No Show' },
        { text: 'Add to Google Calendar' },
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
      await instance.getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        { text: 'View and Check Out' },
        // 'No Show' removed in this case
        // { text: 'No Show' },
        { text: 'Add to Google Calendar' },
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
      await instance.getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        // 'Check Out' removed in this case
        // { text: 'Check Out' },
        { text: 'No Show' },
        { text: 'Add to Google Calendar' },
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
      await instance.getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        // 'Check Out' replaced with 'Details' in this case
        { text: 'Details' },
        { text: 'No Show' },
        { text: 'Add to Google Calendar' },
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
      await instance.getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        { text: 'Unblock Slot' },
        { text: 'Back', role: 'cancel' }
      ]);

    // For tomorrow
    instance.selectedDate = moment().add(1, 'day');

    // New appointment
    appointment = createAppointment();
    appointment.datetime_start_at = moment().add(1, 'day').format();
    appointment.status = AppointmentStatuses.new;
    buttons = removeHandlers(
      await instance.getAppointmentActionSheetOptions(appointment)
    );
    expect(buttons)
      .toEqual([
        { text: 'Details' },
        // 'No Show' removed in this case
        // { text: 'No Show' },
        { text: 'Add to Google Calendar' },
        { text: `Call: ${getPhoneNumber(appointment.client_phone)}`},
        { text: `Copy: ${getPhoneNumber(appointment.client_phone)}`},
        { text: 'Cancel Appointment', role: 'destructive' },
        { text: 'Back', role: 'cancel' }
      ]);
  });

  it('should have a button to open change gap time popup', () => {
    let modalController = fixture.debugElement.injector.get(ModalController);
    spyOn(modalController, 'create');

    const onChangeTimeGapClick = fixture.nativeElement.querySelector('[data-test-id=onChangeTimeGapClick]');
    onChangeTimeGapClick.click();

    expect(modalController.create).toHaveBeenCalledWith(PageNames.ChangeGapTime);
  });
});
