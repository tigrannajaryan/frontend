import * as moment from 'moment';
import { Component, NgZone, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  AlertController, Content,
  IonicPage,
  NavController, NavParams, Slides
} from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as deepEqual from 'fast-deep-equal';

import { Logger } from '~/shared/logger';
import { GAWrapper } from '~/shared/google-analytics';
import { PageNames } from '~/core/page-names';
import { showAlert } from '~/core/utils/alert';
import { AppStorage } from '~/core/app-storage';
import { StylistProfile } from '~/shared/stylist-api/stylist-models';
import { Appointment, AppointmentStatuses, Home } from '~/shared/stylist-api/home.models';
import { HomeService } from '~/shared/stylist-api/home.service';
import { AppointmentCheckoutParams } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { LoadProfileAction, ProfileState, selectProfile } from '~/core/components/user-header/profile.reducer';

export enum AppointmentTag {
  NotCheckedOut = 'Not checked out',
  Now = 'Now',
  Next = 'Next'
}

export enum Tabs {
  today = 0,
  upcoming = 1,
  past = 2
}

export enum TabNames {
  today = 'Today',
  upcoming = 'Upcoming',
  past = 'Past'
}

const helpText = `Congratulations! Your registration is complete.<br/><br/>
  This is your homescreen. Your appointments will show up here.<br/><br/>
  You can also edit your information from the tab bar listed below.<br/>Let's get started.`;

@IonicPage({ segment: 'home' })
@Component({
  selector: 'page-home',
  templateUrl: 'home.component.html'
})
export class HomeComponent {
  appointmentTags: AppointmentTag[];
  AppointmentTag = AppointmentTag;
  PageNames = PageNames;
  Tabs = Tabs;
  tabs = [
    {
      name: TabNames.today,
      loaded: false,
      appointments: []
    },
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
  home: Home;
  isLoading: boolean;
  @ViewChild(Slides) slides: Slides;
  @ViewChild(Content) content: Content;

  profile: Observable<StylistProfile>;

  refresherEnabled = true;

  autoRefreshTimer: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public homeService: HomeService,
    public alertCtrl: AlertController,
    private ngZone: NgZone,
    private store: Store<ProfileState>,
    private actionSheetCtrl: ActionSheetController,
    private appStorage: AppStorage,
    private logger: Logger,
    private ga: GAWrapper
  ) {
  }

  ionViewCanEnter(): Promise<boolean> {
    this.logger.info('HomeComponent: ionViewCanEnter');

    // Make sure appStorage is ready before we enter this page
    return this.appStorage.ready().then(() => true);
  }

  ionViewDidLoad(): void {
    this.activeTab = this.tabs[Tabs.today].name;
  }

  // we need ionViewWillEnter here because it fire each time when we go to this page
  // for example form adding appointment using nav.pop
  // and ionViewDidLoad fire only once this is not what we need here
  ionViewWillEnter(): void {
    this.logger.info('HomeComponent: entering.');

    if (this.appStorage.get('showHomeScreenHelp')) {
      showAlert('', helpText);
      this.appStorage.set('showHomeScreenHelp', false);
    }

    // Load profile info
    this.profile = this.store.select(selectProfile);
    this.store.dispatch(new LoadProfileAction());

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

  onAppointmentClick(appointment: Appointment): void {
    // if this is past tab => open checkout page immediately
    if (this.activeTab === this.tabs[Tabs.past].name) {
      this.checkOutAppointmentClick(appointment);
      return;
    }

    const buttons = [
      {
        text: 'Checkout Client',
        handler: () => {
          this.checkOutAppointmentClick(appointment);
        }
      }, {
        text: 'Cancel Appointment',
        role: 'destructive',
        handler: () => {
          this.cancelAppointment(appointment);
        }
      }, {
        text: 'Back',
        role: 'cancel'
      }
    ];

    // remove 'Checkout Client' if this is upcoming tab
    if (this.activeTab === this.tabs[Tabs.upcoming].name) {
      buttons.splice(0, 1);
    }

    const actionSheet = this.actionSheetCtrl.create({ buttons });
    actionSheet.present();
  }

  /**
   * Handler for 'Checkout Client' action.
   */
  checkOutAppointmentClick(appointment: Appointment): void {
    const data: AppointmentCheckoutParams = {
      appointmentUuid: appointment.uuid,
      isAlreadyCheckedOut: appointment.status !== AppointmentStatuses.new
    };
    this.navCtrl.push(PageNames.AppointmentCheckout, { data });
  }

  /**
   * Handler for 'Cancel' action.
   */
  async cancelAppointment(appointment: Appointment): Promise<void> {
    await this.homeService.changeAppointment(appointment.uuid, { status: AppointmentStatuses.cancelled_by_stylist });
    this.loadAppointments(this.activeTab);
  }

  async onRefresh(refresher): Promise<void> {
    try {
      // Reload the profile information
      this.store.dispatch(new LoadProfileAction());

      // and reload the appointments list on active tab
      await this.loadAppointments(this.activeTab);
    } finally {

      // When appointment reloading is done close the refresher. This is a bit hacky
      // because it not wait for profile loading to compelte but is likely good enough
      // since all we need is to indicate loading and in reality profile will be
      // loaded faster that the list of appointments.
      refresher.complete();
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

  onEnableRefresher(isEnabled: boolean): void {
    this.refresherEnabled = isEnabled;
  }

  private async loadAppointments(tabType: TabNames): Promise<void> {
    this.activeTab = tabType || this.tabs[Tabs.today].name;
    const query = this.activeTab.toLowerCase();

    this.isLoading = true;
    try {
      const home = await this.homeService.getHome(query);
      this.processHomeData(home);
      // Tell the content to recalculate its dimensions. According to Ionic docs this
      // should be called after dynamically adding/removing headers, footers, or tabs.
      // See https://ionicframework.com/docs/api/components/content/Content/#resize
      this.content.resize();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Processes home's data received from the backend and creates
   * the tags for each appointment card.
   */
  private processHomeData(home: Home): void {
    if (!(home && home.appointments)) {
      return;
    }
    const index = this.tabs.findIndex(item => item.name === this.activeTab);

    this.tabs[index].appointments = home.appointments;
    this.tabs[index].loaded = true;

    let viewChanged = false;

    // appointmentTags for today tab
    if (this.activeTab === this.tabs[Tabs.today].name) {
      // Create tags for each appointment based on their start/end times
      const appointmentTags: AppointmentTag[] = [];

      let metNext = false;
      for (const appointment of home.appointments) {
        const startTime = moment(new Date(appointment.datetime_start_at));

        const endTime = startTime.clone();
        endTime.add(appointment.duration_minutes, 'minutes');

        const now = moment();

        let tag: AppointmentTag;
        if (startTime < now) {
          if (endTime > now) {
            tag = AppointmentTag.Now;
          } else {
            tag = AppointmentTag.NotCheckedOut;
          }
        } else {
          if (!metNext) {
            tag = AppointmentTag.Next;
            metNext = true;
          }
        }
        appointmentTags.push(tag);
      }

      if (!deepEqual(this.appointmentTags, appointmentTags)) {
        viewChanged = true;
        this.appointmentTags = appointmentTags;
      }
    }

    if (!deepEqual(this.home, home)) {
      viewChanged = true;
      this.home = home;
    }

    // slide to needed tab if data is changed
    if (this.slides) {
      const animationSpeed = 500;
      this.slides.slideTo(index, animationSpeed);

      if (viewChanged) {
        this.content.scrollToTop(animationSpeed);
      }
    }
  }
}
