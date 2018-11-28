// TODO: Remove this component, it is not used anywhere.

import { Component, NgZone, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  AlertController, Content,
  NavController, NavParams, Slides
} from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import * as deepEqual from 'fast-deep-equal';
import { formatNumber } from 'libphonenumber-js';

import { Logger } from '~/shared/logger';
import { GAWrapper } from '~/shared/google-analytics';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { NumberFormat } from '~/shared/directives/phone-input.directive';
import { ApiResponse } from '~/shared/api/base.models';

import { PageNames } from '~/core/page-names';
import { Appointment, AppointmentStatuses, HomeData } from '~/core/api/home.models';
import { HomeService } from '~/core/api/home.service';
import { AppointmentCheckoutParams } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { ProfileDataStore } from '~/core/profile.data';

export enum AppointmentTag {
  NotCheckedOut = 'Not checked out',
  Now = 'Now',
  Next = 'Next',
  New = 'New',
  NoShow = 'No-show'
}

export enum Tabs {
  upcoming = 0,
  past = 1
}

export enum TabNames {
  upcoming = 'Upcoming',
  past = 'Past'
}

export interface UpcomingAndPastPageParams {
  showTab: Tabs;
}

@Component({
  selector: 'page-upcoming-and-past',
  templateUrl: 'home.component.html'
})
export class UpcomingAndPastComponent {
  AppointmentTag = AppointmentTag;
  PageNames = PageNames;
  Tabs = Tabs;
  tabs = [
    {
      name: TabNames.upcoming,
      loaded: false,
      appointments: []
    },
    {
      name: TabNames.past,
      loaded: false,
      appointments: []
    }
  ];
  activeTab: TabNames;
  home: HomeData;
  isLoading: boolean;
  @ViewChild(Slides) slides: Slides;
  @ViewChild(Content) content: Content;

  autoRefreshTimer: any;

  getHomeSubscription: Subscription;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public homeService: HomeService,
    public alertCtrl: AlertController,
    private ngZone: NgZone,
    private actionSheetCtrl: ActionSheetController,
    private logger: Logger,
    private ga: GAWrapper,
    private externalAppService: ExternalAppService,
    private profileDataStore: ProfileDataStore
  ) {
  }

  ionViewDidLoad(): void {
    const params = this.navParams.get('params') as UpcomingAndPastPageParams;
    this.activeTab = this.tabs[params ? params.showTab : Tabs.upcoming].name;
  }

  // we need ionViewWillEnter here because it fire each time when we go to this page
  // for example form adding appointment using nav.pop
  // and ionViewDidLoad fire only once this is not what we need here
  ionViewWillEnter(): void {
    this.logger.info('HomeComponent: entering.');

    this.loadAppointments(this.activeTab);

    // Autorefresh the view once per hour. This is a temporary solution until
    // we implement push notifications.
    // We must run this repetitive action outside Angular Zone otherwise
    // Protractor thinks that Angular is always busy, which results in Protractor
    // waiting infinitely for Angular and tests timing out.
    this.ngZone.runOutsideAngular(() => {
      this.autoRefreshTimer = setInterval(() => {
        this.ngZone.run(() => {
          this.autoRefresh();
        });
      },
        1000 * 3600);
    });
  }

  ionViewWillLeave(): void {
    clearInterval(this.autoRefreshTimer);
  }

  autoRefresh(): void {
    // don't auto refresh Past tab, since it may be a lot of info and
    // we don't really care about refreshing it automatically.
    if (this.activeTab !== TabNames.past) {
      this.loadAppointments(this.activeTab);
    }
  }

  async onAppointmentClick(appointment: Appointment): Promise<void> {
    // if this is past tab => open checkout page immediately
    if (this.activeTab === this.tabs[Tabs.past].name) {
      this.checkOutAppointmentClick(appointment);
      return;
    }

    // Build the list of action buttons to show
    const buttons = [];

    if (this.activeTab !== this.tabs[Tabs.upcoming].name) {
      // If we are not on Upcoming tab show the "Checkout" action
      buttons.push({
        text: 'Checkout client',
        handler: () => {
          this.checkOutAppointmentClick(appointment);
        }
      });

      // and "no-show" action
      buttons.push({
        text: 'Client no-show',
        handler: () => {
          this.markNoShow(appointment);
        }
      });
    }

    if (appointment.client_phone) {
      // If the client phone number is know show "Call client" action
      buttons.push(
        {
          text: `Copy phone: ${formatNumber(appointment.client_phone, NumberFormat.International)}`,
          handler: () => {
            this.externalAppService.copyToTheClipboard(appointment.client_phone);
          }
        },
        {
          text: `Call client: ${formatNumber(appointment.client_phone, NumberFormat.International)}`,
          handler: () => {
            this.externalAppService.doPhoneCall(appointment.client_phone);
          }
        }
      );
    }

    const profile = (await this.profileDataStore.get()).response;
    if (profile && !profile.google_calendar_integrated) {
      // Google Calendar is not integrated, show action to do it.
      buttons.push({
        text: 'Add to Google Calendar',
        handler: () => this.navCtrl.push(PageNames.CalendarPriming)
      });
    }

    // Add "Cancel appointment" and "Back" actions
    buttons.splice(buttons.length, 0,
      {
        text: 'Cancel appointment',
        role: 'destructive',
        handler: () => {
          this.cancelAppointment(appointment);
        }
      },
      {
        text: 'Back',
        role: 'cancel'
      }
    );

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
      this.loadAppointments(this.activeTab);
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
      this.loadAppointments(this.activeTab);
    }
  }

  // swipe action for tabs
  onSlideChange(): void {
    // if index more or equal to tabs length we got an error
    if (this.slides.getActiveIndex() >= this.tabs.length) {
      return;
    }
    this.activeTab = this.tabs[this.slides.getActiveIndex()].name;
    this.loadAppointments(this.activeTab);
    this.ga.trackView(`Home${this.activeTab}`);
  }

  private async loadAppointments(tabType: TabNames): Promise<void> {
    this.activeTab = tabType || this.tabs[Tabs.upcoming].name;
    const query = this.activeTab.toLowerCase();

    this.isLoading = true;
    try {
      // Cancel request on the fly to prevent a bug:
      // when you change the tabs speedily
      // you may see appointments in the wrong tab
      // because of response delay
      if (this.getHomeSubscription) {
        this.getHomeSubscription.unsubscribe();
      }
      this.getHomeSubscription = this.homeService.getHome(query).subscribe(({ response }: ApiResponse<HomeData>) => {
        if (!response) {
          return;
        }
        this.processHomeData(response);
        // Tell the content to recalculate its dimensions. According to Ionic docs this
        // should be called after dynamically adding/removing headers, footers, or tabs.
        // See https://ionicframework.com/docs/api/components/content/Content/#resize
        this.content.resize();
      });
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Processes home's data received from the backend and creates
   * the tags for each appointment card.
   */
  private processHomeData(home: HomeData): void {
    if (!(home && home.appointments)) {
      return;
    }
    const index = this.tabs.findIndex(item => item.name === this.activeTab);

    this.tabs[index].appointments = home.appointments;
    this.tabs[index].loaded = true;

    if (!deepEqual(this.home, home)) {
      this.home = home;
    }

    // slide to needed tab if data is changed
    if (this.slides) {
      const animationSpeed = 500;
      this.slides.slideTo(index, animationSpeed);
    }
  }
}
