import { Component, NgZone, ViewChild } from '@angular/core';
import { ActionSheetController, Content, NavController } from 'ionic-angular';
import { DatePicker } from '@ionic-native/date-picker';
import * as moment from 'moment';
import * as deepEqual from 'fast-deep-equal';

import { Logger } from '~/shared/logger';
import { showAlert } from '~/shared/utils/alert';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { setIntervalOutsideNgZone } from '~/shared/utils/timer-utils';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';

import { Appointment, AppointmentStatuses, DayAppointments } from '~/core/api/home.models';
import { HomeService } from '~/core/api/home.service';
import { AppointmentCheckoutParams } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { PageNames } from '~/core/page-names';
import { StylistAppStorage } from '~/core/stylist-app-storage';

import { Tabs, UpcomingAndPastPageParams } from '~/home/home.component';
import { AppointmentAddParams } from '~/appointment/appointment-add/appointment-add';
import { FreeSlot, isBlockedTime } from './time-slots/time-slots.component';
import { AppointmentsDataStore } from './appointments.data';
import { formatNumber } from 'libphonenumber-js';
import { NumberFormat } from '~/shared/directives/phone-input.directive';

const helpText = `Congratulations! Your registration is complete.<br/><br/>
  This is your homescreen. Your appointments will show up here.<br/><br/>
  You can also edit your information from the tab bar listed below.<br/>Let's get started.`;

// Default data that we display until the real data is being loaded
const defaultData: DayAppointments = {
  appointments: []
};

@Component({
  selector: 'home-slots',
  templateUrl: 'home-slots.component.html'
})
export class HomeSlotsComponent {
  PageNames = PageNames;

  // Data received from API and used in HTML
  data: DayAppointments = defaultData;

  // Data is currently loading
  @ViewChild(Content) content: Content;

  autoRefreshTimer: any;

  // Current displayed date
  curDate: Date;

  // And its components as strings (used in HTML)
  curMonthName: string;
  curWeekdayName: string;
  curDayOfMonth: string;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private appointmentsDataStore: AppointmentsDataStore,
    private appStorage: StylistAppStorage,
    private datePicker: DatePicker,
    private navCtrl: NavController,
    private homeService: HomeService,
    private ngZone: NgZone,
    private logger: Logger,
    private externalAppService: ExternalAppService
  ) {
  }

  ionViewCanEnter(): Promise<boolean> {
    this.logger.info('HomeSlotsComponent: ionViewCanEnter');

    // Make sure appStorage is ready before we enter this page
    return this.appStorage.ready().then(() => true);
  }

  async ionViewWillLoad(): Promise<void> {
    // Select and show today's date
    this.selectDate(new Date(), false);
  }

  // we need ionViewWillEnter here because it fire each time when we go to this page
  // for example form adding appointment using nav.pop
  // and ionViewDidLoad fire only once this is not what we need here
  async ionViewWillEnter(): Promise<void> {
    this.logger.info('HomeSlotsComponent: entering.');

    if (this.appStorage.get('showHomeScreenHelp')) {
      showAlert('', helpText);
      this.appStorage.set('showHomeScreenHelp', false);
    }

    this.loadAppointments();

    // Autorefresh the view once every 10 mins. This is a temporary solution until
    // we implement push notifications.
    const autoRefreshInterval = moment.duration(10, 'minute').asMilliseconds();
    this.autoRefreshTimer = await setIntervalOutsideNgZone(this.ngZone, () => this.loadAppointments(), autoRefreshInterval);
  }

  ionViewWillLeave(): void {
    clearInterval(this.autoRefreshTimer);
  }

  onAppointmentClick(appointment: Appointment): void {
    // Build the list of action buttons to show
    const buttons = [];

    if (!isBlockedTime(appointment)) {
      // Show "Details" or "Checkout" action for real appointments
      buttons.push({
        text: appointment.status === AppointmentStatuses.checked_out ? 'Details' : 'Checkout client',
        handler: () => {
          this.checkOutAppointmentClick(appointment);
        }
      });

      if (moment(this.curDate).startOf('day').isSameOrBefore(moment())) {
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
    }

    if (appointment.client_phone) {
      // If the phone number is known show "Call" and "Copy" actions
      buttons.push(
        {
          text: `Call: ${getPhoneNumber(appointment.client_phone)}`,
          handler: () => {
            this.externalAppService.doPhoneCall(appointment.client_phone);
          }
        },
        {
          text: `Copy: ${formatNumber(appointment.client_phone, NumberFormat.International)}`,
          handler: () => {
            this.externalAppService.copyToTheClipboard(appointment.client_phone);
          }
        }
      );
    }

    if (isBlockedTime(appointment)) {
      // Add "Unblock" action for blocked slots
      buttons.push(
        {
          text: 'Unblock Slot',
          handler: () => {
            this.cancelAppointment(appointment);
          }
        });
    } else {
      // Add "Cancel appointment" action for real appointments
      buttons.push({
        text: 'Cancel Appointment',
        role: 'destructive',
        handler: () => {
          this.cancelAppointment(appointment);
        }
      });
    }

    buttons.push({
      text: 'Back',
      role: 'cancel'
    });

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
    // Show the current time line only if we are showing today
    return this.curDate && this.curDate.toDateString() === new Date().toDateString();
  }

  protected onTodayNavigateClick(): void {
    this.selectDate(new Date(), true);
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
    const params: AppointmentAddParams = { startDate: moment(this.curDate).startOf('day') };
    this.navCtrl.push(PageNames.AppointmentAdd, { params });
  }

  protected onDateAreaClick(): void {
    this.datePicker.show({
      date: this.curDate, // Start with current date
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
    }).then(
      date => this.selectDate(date, true),
      err => {
        // Nothing to do. Navigation cancelled.
      }
    );
  }

  protected onUpcomingClick(): void {
    const params: UpcomingAndPastPageParams = { showTab: Tabs.upcoming };
    this.navCtrl.push(PageNames.Home, { params });
  }

  protected onPastClick(): void {
    const params: UpcomingAndPastPageParams = { showTab: Tabs.past };
    this.navCtrl.push(PageNames.Home, { params });
  }

  /**
   * Set the date to show appointments for and load and display the appointments.
   */
  private selectDate(date: Date, loadAppointments: boolean): void {
    this.curDate = date;
    this.curMonthName = moment(date).format('MMM');
    this.curWeekdayName = moment(date).format('dddd');
    this.curDayOfMonth = moment(date).format('D');

    if (loadAppointments) {
      this.loadAppointments();
    }
  }

  private async loadAppointments(): Promise<void> {
    const data = await this.appointmentsDataStore.get(this.curDate);
    this.processAppointments({ appointments: data.response });
  }

  /**
   * Remembers data received from the backend and updates the view.
   */
  private processAppointments(data: DayAppointments): void {
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
