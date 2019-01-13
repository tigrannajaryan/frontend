import { async, ComponentFixture } from '@angular/core/testing';
import { ModalController } from 'ionic-angular';
import { ActionSheetButton } from 'ionic-angular/components/action-sheet/action-sheet-options';
import * as moment from 'moment';

import { AppointmentStatus, StylistAppointmentModel } from '~/shared/api/appointments.models';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';
import { WeekdayIso } from '~/shared/weekday';

import { PageNames } from '~/core/page-names';
import { ProfileDataStore } from '~/core/profile.data';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

import { TestUtils } from '../../test';

import { AppointmentsDataStore } from './appointments.data';
import { HomeSlotsComponent } from './home-slots.component';
import { createAppointment } from './time-slots/time-slots.component.spec';

const weekdays = [
  // Has appointments only on Monday:
  { weekday_iso: WeekdayIso.Mon, is_working_day: true, has_appointments: true, label: '', work_start_at: '', work_end_at: '' },
  { weekday_iso: WeekdayIso.Tue, is_working_day: true, has_appointments: false, label: '', work_start_at: '', work_end_at: '' },
  { weekday_iso: WeekdayIso.Wed, is_working_day: true, has_appointments: false, label: '', work_start_at: '', work_end_at: '' },
  { weekday_iso: WeekdayIso.Thu, is_working_day: true, has_appointments: false, label: '', work_start_at: '', work_end_at: '' },
  // Mark only Friday ad non-working (TGI Friday):
  { weekday_iso: WeekdayIso.Fri, is_working_day: false, has_appointments: false, label: '', work_start_at: '', work_end_at: '' },
  { weekday_iso: WeekdayIso.Sat, is_working_day: true, has_appointments: false, label: '', work_start_at: '', work_end_at: '' },
  { weekday_iso: WeekdayIso.Sun, is_working_day: true, has_appointments: false, label: '', work_start_at: '', work_end_at: '' }
];

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

  it('should select date on month name click', async done => {
    const modal = fixture.debugElement.injector.get(ModalController);
    spyOn(modal, 'create').and.returnValue({
      present(): any {}
    });

    await instance.onDateAreaClick();

    expect(modal.create)
      .toHaveBeenCalled();

    done();
  });

  it('should show weekdays selector', () => {
    const today = moment();
    const startOfWeek = moment(today).startOf('week');

    instance.selectedDate = today;
    instance.weekdays = weekdays;

    fixture.detectChanges();

    let dateWithAppointments: moment.Moment;
    let disabledDate: moment.Moment;

    // Check all weekdays present:
    for (let i = WeekdayIso.Mon; i <= WeekdayIso.Sun; i++) {
      const date = moment(startOfWeek).add(i - 1, 'days');

      expect(fixture.nativeElement.textContent)
        .toContain(date.format('ddd'));
      expect(fixture.nativeElement.textContent)
        .toContain(date.format('D'));

      if (date.isoWeekday() === WeekdayIso.Mon) {
        dateWithAppointments = date;
      }

      if (date.isoWeekday() === WeekdayIso.Fri) {
        disabledDate = date;
      }
    }

    // WARNING: template-dependant selector
    const highlightedEl: HTMLElement = fixture.nativeElement.querySelector('.HCalendar-date.is-highlighted');

    // Check Monday is highlighted (has appointments and a red dot indicator):
    expect(highlightedEl)
      .toBeTruthy();
    expect(highlightedEl.textContent)
      .toContain(dateWithAppointments.format('ddd'));
    expect(highlightedEl.textContent)
      .toContain(dateWithAppointments.format('D'));

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

    let appointment: StylistAppointmentModel;
    let buttons: ActionSheetButton[];

    // For today
    instance.selectedDate = moment();

    // New appointment
    appointment = createAppointment();
    appointment.datetime_start_at = startOfToday;
    appointment.status = AppointmentStatus.new;
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
    appointment.status = AppointmentStatus.new;
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
    appointment.status = AppointmentStatus.no_show;
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
    appointment.status = AppointmentStatus.cancelled_by_client;
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
    appointment.status = AppointmentStatus.checked_out;
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
    appointment.status = AppointmentStatus.new;
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
    appointment.status = AppointmentStatus.new;
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
    const modalController = fixture.debugElement.injector.get(ModalController);
    spyOn(modalController, 'create');

    const onChangeTimeGapClick = fixture.nativeElement.querySelector('[data-test-id=onChangeTimeGapClick]');
    onChangeTimeGapClick.click();

    expect(modalController.create).toHaveBeenCalledWith(PageNames.ChangeGapTime);
  });

  it('should not be able to click on calendar icon if this is current day', () => {
    const onTodayNavigateClick = fixture.nativeElement.querySelector('[data-test-id=onTodayNavigateClick]');
    onTodayNavigateClick.click();
    spyOn(instance, 'onTodayNavigateClick');

    expect(instance.onTodayNavigateClick).not.toHaveBeenCalledWith();
  });
});
