import { Component, NgZone, ViewChild } from '@angular/core';
import { ActionSheetController, Content, Events, ModalController, NavController } from 'ionic-angular';
import { ActionSheetButton } from 'ionic-angular/components/action-sheet/action-sheet-options';
import * as moment from 'moment';
import * as deepEqual from 'fast-deep-equal';

import { Logger } from '~/shared/logger';
import { showAlert } from '~/shared/utils/alert';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { setIntervalOutsideNgZone } from '~/shared/utils/timer-utils';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';
import { Workday } from '~/shared/api/worktime.models';
import { Weekday } from '~/shared/weekday';

import { Appointment, AppointmentStatuses, DayAppointmentsResponse } from '~/core/api/home.models';
import { HomeService } from '~/core/api/home.service';
import { WorktimeApi } from '~/core/api/worktime.api';
import { AppointmentCheckoutParams } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { PageNames } from '~/core/page-names';
import { StylistAppStorage } from '~/core/stylist-app-storage';
import { ProfileDataStore } from '~/core/profile.data';

import { AppointmentAddParams } from '~/appointment/appointment-add/appointment-add';

import { FreeSlot } from './time-slots/time-slots.component';
import { isBlockedTime } from './time-slot-content/time-slot-content.component';
import { AppointmentsDataStore } from './appointments.data';

import { ISODate, isoDateFormat } from '~/shared/api/base.models';
import { CalendarPrimingParams } from '~/shared/components/calendar-priming/calendar-priming.component';
import {
  CalendarPickerComponent,
  CalendarPickerParams,
  DaysInMonth,
  DefaultWeekday,
  DefaultWeekdays
} from '~/shared/components/calendar-picker/calendar-picker.component';

import { FocusAppointmentEventParams, StylistEventTypes } from '~/core/stylist-event-types';

const helpText = `Congratulations! Your registration is complete.<br/><br/>
  This is your home screen. Your appointments will show up here.<br/><br/>
  Let's get started.`;

// Default data that we display until the real data is being loaded
const defaultData: DayAppointmentsResponse = {
  appointments: [],
  first_slot_start_time: '9:00', // in hh:mm format in stylist timezone
  service_time_gap_minutes: 30, // in minutes interval between slots
  total_slot_count: 16,
  work_start_at: '9:00', // in hh:mm working hours start
  work_end_at: '17:00', // in hh:mm working hours end
  is_day_available: true // is a working day
};

@Component({
  selector: 'home-slots',
  templateUrl: 'home-slots.component.html'
})
export class HomeSlotsComponent {
  PageNames = PageNames;

  // Data received from API and used in HTML
  data: DayAppointmentsResponse = defaultData;

  // Data is currently loading
  @ViewChild(Content) content: Content;

  autoRefreshTimer: any;

  // Current selected date
  selectedDate: moment.Moment = moment().startOf('day');

  // Non-working weekdays
  disabledWeekdays: Weekday[] = [];

  // Is fully blocked (non-working day)
  isFullyBlocked = false;

  // An appointment we want to highlight:
  highlightedAppointment: Appointment;

  // And its components as strings (used in HTML)
  selectedMonthName: string;
  selectedWeekdayName: string;
  selectedDayOfMonth: string;

  private static isUpcomingAppointment(appointment: Appointment): boolean {
    return moment(appointment.datetime_start_at).isAfter(moment(), 'day');
  }

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private appointmentsDataStore: AppointmentsDataStore,
    private appStorage: StylistAppStorage,
    private events: Events,
    private externalAppService: ExternalAppService,
    private homeService: HomeService,
    private logger: Logger,
    private navCtrl: NavController,
    private ngZone: NgZone,
    private profileDataStore: ProfileDataStore,
    private worktimeApi: WorktimeApi,
    private modalCtrl: ModalController
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    // Set disabled days for horizontal calendar
    await this.setNonWorkingDays();
  }

  // we need ionViewWillEnter here because it fire each time when we go to this page
  // for example form adding appointment using nav.pop
  // and ionViewDidLoad fire only once this is not what we need here
  async ionViewWillEnter(): Promise<void> {
    this.logger.info('HomeSlotsComponent: entering.');

    // Focus on one particullar appointment
    this.events.subscribe(StylistEventTypes.focusAppointment, (params: FocusAppointmentEventParams) => this.focusAppointment(params));

    await this.appStorage.ready();
    if (this.appStorage.get('showHomeScreenHelp')) {
      showAlert('', helpText);
      this.appStorage.set('showHomeScreenHelp', false);
    }

    // Preload data
    this.profileDataStore.get();

    // Load and show appointments for selected date
    await this.loadAppointments();

    // Autorefresh the view once every 10 mins. This is a temporary solution until
    // we implement push notifications.
    const autoRefreshInterval = moment.duration(10, 'minute').asMilliseconds();
    this.autoRefreshTimer = await setIntervalOutsideNgZone(this.ngZone, () => this.loadAppointments(), autoRefreshInterval);
  }

  ionViewWillLeave(): void {
    // Stop autorefresh
    clearInterval(this.autoRefreshTimer);

    this.events.unsubscribe(StylistEventTypes.focusAppointment);
  }

  async setNonWorkingDays(): Promise<void> {
    const { response } = await this.worktimeApi.getWorktime().get();
    if (response) {
      this.disabledWeekdays =
        response.weekdays
          .filter((weekday: Workday): boolean => !weekday.work_start_at) // null for non-working
          .map((weekday: Workday): Weekday => ({ isoWeekday: weekday.weekday_iso }));
    }
  }

  onBlockedDayClick(): void {
    const actionSheet = this.actionSheetCtrl.create({
      buttons: this.getBlockedDayActionSheetOptions()
    });
    actionSheet.present();
  }

  getBlockedDayActionSheetOptions(): ActionSheetButton[] {
    return [{
      text: 'Unblock Day',
      role: 'destructive',
      handler: () => {
        this.worktimeApi
          .setWorkdayAvailable(this.selectedDate, true)
          .toPromise()
          .then(() => this.loadAppointments());
      }
    }, {
      text: 'Back',
      role: 'cancel'
    }];
  }

  async onAppointmentClick(appointment: Appointment): Promise<void> {
    const buttons = await this.getAppointmentActionSheetOptions(appointment);
    const actionSheet = this.actionSheetCtrl.create({ buttons });
    actionSheet.present();
  }

  /**
   * Handler for 'No-show' action.
   */
  async markNoShow(appointment: Appointment): Promise<void> {
    const { response } = await this.homeService.changeAppointment(appointment.uuid,
      { status: AppointmentStatuses.no_show }).get();
    if (response) {
      this.loadAppointments();
    }
  }

  /**
   * Handler for 'Checkout Client' action.
   */
  checkOutOrDetailsClick(appointment: Appointment): void {
    const data: AppointmentCheckoutParams = {
      appointmentUuid: appointment.uuid,

      // Allow to checkout any appointment that is not already checked out.
      isAlreadyCheckedOut: appointment.status === AppointmentStatuses.checked_out,
      isReadonly: HomeSlotsComponent.isUpcomingAppointment(appointment)
    };
    this.navCtrl.push(PageNames.AppointmentCheckout, { data });
  }

  /**
   * Handler for 'Cancel' action.
   */
  async cancelAppointment(appointment: Appointment): Promise<void> {
    const { response } = await this.homeService.changeAppointment(appointment.uuid,
      { status: AppointmentStatuses.cancelled_by_stylist }).get();
    if (response) {
      this.loadAppointments();
    }
  }

  isShowingToday(): boolean {
    return this.selectedDate && this.selectedDate.isSame(moment(), 'day');
  }

  onTodayNavigateClick(): void {
    this.selectDateAndLoadAppointments(moment().startOf('day'));
  }

  onChangeTimeGapClick(): void {
    const modal = this.modalCtrl.create(PageNames.ChangeGapTime);
    modal.present();
  }

  onSelectedDateChange(date: moment.Moment): void {
    this.selectDateAndLoadAppointments(date);
  }

  onFreeSlotClick(freeSlot: FreeSlot): void {
    // Show Appointment Add screen when clicked on a free slot.
    // Preset the date and time of appointment since we already know it.
    const params: AppointmentAddParams = { startDateTime: freeSlot.startTime };
    this.navCtrl.push(PageNames.AppointmentAdd, { params });
  }

  onDateAreaClick(): void {
    const defaultWeekdays = [];

    for (let isoWeekday = 1; isoWeekday <= 7; isoWeekday++) {
      const weekday: DefaultWeekday = {
        isoWeekday,
        isFaded: this.disabledWeekdays.some(day => day.isoWeekday === isoWeekday)
      };
      defaultWeekdays.push(weekday);
    }

    const params: CalendarPickerParams = {
      defaultWeekdays: defaultWeekdays as DefaultWeekdays,
      selectedIsoDate: this.selectedDate.format(isoDateFormat),
      onDaysLoaded: async (days: DaysInMonth): Promise<void> => {
        const dates = Array.from(days.keys());

        const { response = [] } = await this.homeService.getAppointments({
            date_from: new Date(dates[0]),
            date_to: new Date(dates[dates.length - 1])
          }).toPromise();

        for (const appointment of response) {
          const appointmentDate = appointment.datetime_start_at.split('T')[0];
          days.get(appointmentDate).isHighlighted = true;
        }
      },
      onDateSelected: (date: ISODate): void => {
        this.selectDateAndLoadAppointments(moment(date));
      }
    };
    const popup = this.modalCtrl.create(CalendarPickerComponent, { params });
    popup.present();
  }

  onAddAppointmentClick(): void {
    // Show Appointment Add screen when clicked on Add Appointment button.
    // Preset the date of appointment since we already know it.
    const params: AppointmentAddParams = { startDate: moment(this.selectedDate).startOf('day') };
    this.navCtrl.push(PageNames.AppointmentAdd, { params });
  }

  /**
   * Get action sheet buttons for an appointment
   */
  async getAppointmentActionSheetOptions(appointment: Appointment): Promise<ActionSheetButton[]> {
    // Build the list of action buttons to show
    const buttons: ActionSheetButton[] = [];

    if (!isBlockedTime(appointment)) {
      // Show "Details" or "Checkout" action for real appointments
      if (appointment.status !== AppointmentStatuses.cancelled_by_client) {

        const text = (appointment.status === AppointmentStatuses.checked_out ||
          HomeSlotsComponent.isUpcomingAppointment(appointment)) ? 'Details' : 'View and Check Out';

        buttons.push({
          text,
          handler: () => {
            this.checkOutOrDetailsClick(appointment);
          }
        });
      }

      const appointmentEndTime = moment(appointment.datetime_start_at).add(appointment.duration_minutes, 'minutes');

      if (appointmentEndTime.isSameOrBefore(moment()) && appointment.status !== AppointmentStatuses.no_show) {
        // We are showing today or a past date. Add "no-show" action.
        // We don't want to show it for future dates because it makes no sense
        // to mark someone no-show if it is not yet time for the appointment.
        buttons.push({
          text: 'No Show',
          handler: () => {
            this.markNoShow(appointment);
          }
        });
      }

      const profile = (await this.profileDataStore.get()).response;
      if (profile && !profile.google_calendar_integrated) {
        // Google Calendar is not integrated, show action to do it.
        const params: CalendarPrimingParams = {
          // refresh profile status on success, so that we don't show "Add to Calendar"
          // action anymore.
          onSuccess: () => this.profileDataStore.refresh()
        };
        buttons.push({
          text: 'Add to Google Calendar',
          handler: () => { this.navCtrl.push(PageNames.CalendarPriming, { params }); }
        });
      }

      if (appointment.client_phone) {
        // If the phone number is known show "Call" and "Copy" actions
        const formattedPhoneNum = getPhoneNumber(appointment.client_phone);
        buttons.push(
          {
            text: `Call: ${formattedPhoneNum}`,
            handler: () => {
              this.externalAppService.doPhoneCall(formattedPhoneNum);
            }
          },
          {
            text: `Copy: ${formattedPhoneNum}`,
            handler: () => {
              this.externalAppService.copyToTheClipboard(formattedPhoneNum);
            }
          }
        );
      }

      // Add "Cancel appointment" action for real appointments
      buttons.push({
        text: appointment.status === AppointmentStatuses.cancelled_by_client ? 'Delete Appointment' : 'Cancel Appointment',
        role: 'destructive',
        handler: () => {
          this.cancelAppointment(appointment);
        }
      });

    } else { // if isBlockedTime(appointment)
      // Add only "Unblock" action for blocked slots
      buttons.push(
        {
          text: 'Unblock Slot',
          handler: () => {
            this.cancelAppointment(appointment);
          }
        });
    }

    buttons.push({
      text: 'Back',
      role: 'cancel'
    });

    return buttons;
  }

  private async focusAppointment(params: FocusAppointmentEventParams): Promise<void> {
    await this.selectDateAndLoadAppointments(moment(params.appointment_datetime_start_at));

    const highlightedAppointment = this.data.appointments.find(appointment => {
      return appointment.uuid === params.appointment_uuid;
    });
    this.highlightedAppointment = highlightedAppointment;
  }

  /**
   * Set the date to show appointments for.
   */
  private selectDate(date: moment.Moment): void {
    const newDate = date.clone().startOf('day');

    this.highlightedAppointment = undefined;

    this.selectedDate = newDate;
    this.selectedMonthName = date.format('MMM');
    this.selectedWeekdayName = date.format('dddd');
    this.selectedDayOfMonth = date.format('D');
  }

  /**
   * Set the date to show appointments for and load and display the appointments.
   */
  private async selectDateAndLoadAppointments(date: moment.Moment): Promise<void> {
    this.selectDate(date);
    await this.loadAppointments();
  }

  private async loadAppointments(): Promise<void> {
    const data = await this.appointmentsDataStore.get(this.selectedDate);

    // Is fully-blocked?
    const { response } = await this.worktimeApi.getWorkdayAvailable(this.selectedDate).toPromise();
    if (response) {
      this.isFullyBlocked = !response.is_available;
    } else {
      this.isFullyBlocked = false;
    }

    this.processAppointments(data.response);
  }

  /**
   * Remembers data received from the backend and updates the view.
   */
  private processAppointments(data: DayAppointmentsResponse): void {
    if (!(data && data.appointments)) {
      return;
    }

    // Check if data is changed. We do this to avoid redrawing the view if nothing is changed.
    if (!deepEqual(this.data, data)) {
      this.data = data;

      // Tell the content to recalculate its dimensions. According to Ionic docs this
      // should be called after dynamically adding/removing headers, footers, or tabs.
      // See https://ionicframework.com/docs/api/components/content/Content/#resize
      this.content.resize();
    }
  }
}
