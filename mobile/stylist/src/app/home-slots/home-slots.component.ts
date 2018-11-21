import { Component, NgZone, ViewChild } from '@angular/core';
import { ActionSheetController, Content, NavController } from 'ionic-angular';
import { ActionSheetButton } from 'ionic-angular/components/action-sheet/action-sheet-options';
import { DatePicker } from '@ionic-native/date-picker';
import * as moment from 'moment';
import * as deepEqual from 'fast-deep-equal';

import { Logger } from '~/shared/logger';
import { showAlert } from '~/shared/utils/alert';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { setIntervalOutsideNgZone } from '~/shared/utils/timer-utils';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';

import { Appointment, AppointmentStatuses, DayAppointmentsResponse } from '~/core/api/home.models';
import { HomeService } from '~/core/api/home.service';
import { AppointmentCheckoutParams } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { PageNames } from '~/core/page-names';
import { StylistAppStorage } from '~/core/stylist-app-storage';

import { Tabs, UpcomingAndPastPageParams } from '~/home/home.component';
import { AppointmentAddParams } from '~/appointment/appointment-add/appointment-add';
import { FreeSlot, isBlockedTime } from './time-slots/time-slots.component';
import { AppointmentsDataStore } from './appointments.data';

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

  // And its components as strings (used in HTML)
  selectedMonthName: string;
  selectedWeekdayName: string;
  selectedDayOfMonth: string;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private appointmentsDataStore: AppointmentsDataStore,
    private appStorage: StylistAppStorage,
    private datePicker: DatePicker,
    private externalAppService: ExternalAppService,
    private homeService: HomeService,
    private logger: Logger,
    private navCtrl: NavController,
    private ngZone: NgZone
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    // Select and show today's date
    this.selectDate(moment().startOf('day'));
  }

  // we need ionViewWillEnter here because it fire each time when we go to this page
  // for example form adding appointment using nav.pop
  // and ionViewDidLoad fire only once this is not what we need here
  async ionViewWillEnter(): Promise<void> {
    this.logger.info('HomeSlotsComponent: entering.');

    await this.appStorage.ready();
    if (this.appStorage.get('showHomeScreenHelp')) {
      showAlert('', helpText);
      this.appStorage.set('showHomeScreenHelp', false);
    }

    // Load and show appointments for selected date
    this.loadAppointments();

    // Autorefresh the view once every 10 mins. This is a temporary solution until
    // we implement push notifications.
    const autoRefreshInterval = moment.duration(10, 'minute').asMilliseconds();
    this.autoRefreshTimer = await setIntervalOutsideNgZone(this.ngZone, () => this.loadAppointments(), autoRefreshInterval);
  }

  ionViewWillLeave(): void {
    // Stop autorefresh
    clearInterval(this.autoRefreshTimer);
  }

  onAppointmentClick(appointment: Appointment): void {
    const buttons = this.getAppointmentActionSheetOptions(appointment);
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
  checkOutAppointmentClick(appointment: Appointment): void {
    const data: AppointmentCheckoutParams = {
      appointmentUuid: appointment.uuid,

      // Allow to checkout any appointment that is not already checked out.
      isAlreadyCheckedOut: appointment.status === AppointmentStatuses.checked_out
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

  protected isShowingToday(): boolean {
    return this.selectedDate && this.selectedDate.isSame(moment(), 'day');
  }

  protected onTodayNavigateClick(): void {
    this.selectDateAndLoadAppointments(moment().startOf('day'));
  }

  protected onFreeSlotClick(freeSlot: FreeSlot): void {
    // Show Appointment Add screen when clicked on a free slot.
    // Preset the date and time of appointment since we already know it.
    const params: AppointmentAddParams = { startDateTime: freeSlot.startTime };
    this.navCtrl.push(PageNames.AppointmentAdd, { params });
  }

  protected onAddAppointmentClick(): void {
    // Show Appointment Add screen when clicked on Add Appointment button.
    // Preset the date of appointment since we already know it.
    const params: AppointmentAddParams = { startDate: moment(this.selectedDate).startOf('day') };
    this.navCtrl.push(PageNames.AppointmentAdd, { params });
  }

  protected onDateAreaClick(): void {
    // Show date picker and let the user choose a date, then load appointments
    // for selected date.
    this.datePicker.show({
      date: this.selectedDate.toDate(), // Start with current date
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
    }).then(
      date => this.selectDateAndLoadAppointments(moment(date)),
      err => {
        // Nothing to do. Navigation cancelled.
      }
    );
  }

  protected onUpcomingVisitsClick(): void {
    const params: UpcomingAndPastPageParams = { showTab: Tabs.upcoming };
    this.navCtrl.push(PageNames.Home, { params });
  }

  protected onPastVisitsClick(): void {
    const params: UpcomingAndPastPageParams = { showTab: Tabs.past };
    this.navCtrl.push(PageNames.Home, { params });
  }

  /**
   * Get action sheet buttons for an appointment
   */
  private getAppointmentActionSheetOptions(appointment: Appointment): ActionSheetButton[] {
    // Build the list of action buttons to show
    const buttons: ActionSheetButton[] = [];

    if (!isBlockedTime(appointment)) {
      // Show "Details" or "Checkout" action for real appointments
      if (appointment.status !== AppointmentStatuses.cancelled_by_client) {
        buttons.push({
          text: appointment.status === AppointmentStatuses.checked_out ? 'Details' : 'Check Out',
          handler: () => {
            this.checkOutAppointmentClick(appointment);
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

      // TODO: once Google Calendar integration is ready add "Add to Calendar" action here.

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

  /**
   * Set the date to show appointments for.
   */
  private selectDate(date: moment.Moment): void {
    this.selectedDate = date.clone().startOf('day');
    this.selectedMonthName = moment(date).format('MMM');
    this.selectedWeekdayName = moment(date).format('dddd');
    this.selectedDayOfMonth = moment(date).format('D');
  }

  /**
   * Set the date to show appointments for and load and display the appointments.
   */
  private selectDateAndLoadAppointments(date: moment.Moment): void {
    this.selectDate(date);
    this.loadAppointments();
  }

  private async loadAppointments(): Promise<void> {
    const data = await this.appointmentsDataStore.get(this.selectedDate);
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
