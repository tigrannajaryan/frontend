import * as moment from 'moment';
import { Component, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  AlertController, Content,
  IonicPage,
  NavController, NavParams, Slides
} from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  HomeLoadAction,
  HomeState,
  selectHomeState
} from './home.reducer';

import { AppointmentStatuses, Home } from './home.models';
import { StylistProfile } from '~/core/stylist-service/stylist-models';
import { Appointment } from '~/home/home.models';
import { HomeService } from '~/home/home.service';
import { PageNames } from '~/core/page-names';
import { AppointmentCheckoutParams } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { loading } from '~/core/utils/loading';
import { componentUnloaded } from '~/core/utils/component-unloaded';
import { UserOptions } from '~/core/user-options';
import { showAlert } from '~/core/utils/alert';
import { LoadProfileAction, ProfileState, selectProfile } from '~/core/components/user-header/profile.reducer';
import { GAWrapper } from '~/shared/google-analytics';

export enum AppointmentTag {
  NotCheckedOut = 'Not checked out',
  Now = 'Now',
  Next = 'Next'
}
export enum TabNames {
  today = 0,
  upcoming = 1,
  past = 2
}

const helpText = `Congratulations! You completed your registration.<br/><br/>
  This is your home screen where you will see all appointments for today
  and can add new appointments using the big plus button.<br/><br/>
  You can also tap the icons at the bottom of the screen to edit your settings.`;

@IonicPage({ segment: 'home' })
@Component({
  selector: 'page-home',
  templateUrl: 'home.component.html'
})
export class HomeComponent {
  protected appointmentTags: AppointmentTag[];
  protected AppointmentTag = AppointmentTag;
  protected PageNames = PageNames;
  protected TabNames = TabNames;
  protected tabs = [
    {
      name: 'Today',
      loaded: false,
      appointments: []
    },
    {
      name: 'Upcoming',
      loaded: false,
      appointments: []
    },
    {
      name: 'Past',
      loaded: false,
      appointments: []
    }
  ];
  protected activeTab: string;
  protected home: Home;
  protected isLoading: boolean;
  @ViewChild(Slides) slides: Slides;
  @ViewChild(Content) content: Content;

  protected profile: Observable<StylistProfile>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public homeService: HomeService,
    public alertCtrl: AlertController,
    private store: Store<HomeState & ProfileState>,
    private actionSheetCtrl: ActionSheetController,
    private userOptions: UserOptions,
    private ga: GAWrapper
  ) {
  }

  // we need ionViewDidEnter here because it fire each time when we go to this page
  // for example form adding appointment using nav.pop
  // and ionViewDidLoad fire only once this is not what we need here
  ionViewDidEnter(): void {
    // init active tab
    this.activeTab = this.tabs[TabNames.today].name;

    if (this.userOptions.get('showHomeScreenHelp')) {
      showAlert('', helpText);
      this.userOptions.set('showHomeScreenHelp', false);
    }

    this.store.select(selectHomeState)
      .takeUntil(componentUnloaded(this))
      .subscribe((homeState: HomeState) => {
        this.isLoading = homeState.loading;
        this.processHomeData(homeState.home);
      });

    // Load profile info
    this.profile = this.store.select(selectProfile);
    this.store.dispatch(new LoadProfileAction());

    this.loadAppointments(this.activeTab);
  }

  protected onAppointmentClick(appointment: Appointment): void {
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
    if (this.activeTab === this.tabs[TabNames.upcoming].name) {
      buttons.splice(0, 1);
    }
    // remove 'Cancel Appointment' if this is past tab
    if (this.activeTab === this.tabs[TabNames.past].name) {
      buttons.splice(1, 1);
    }

    const actionSheet = this.actionSheetCtrl.create({ buttons });
    actionSheet.present();
  }

  /**
   * Handler for 'Checkout Client' action.
   */
  protected checkOutAppointmentClick(appointment: Appointment): void {
    const data: AppointmentCheckoutParams = { appointmentUuid: appointment.uuid };
    this.navCtrl.push(PageNames.AppointmentCheckout, { data });
  }

  /**
   * Handler for 'Cancel' action.
   */
  @loading
  protected async cancelAppointment(appointment: Appointment): Promise<void> {
    await this.homeService.changeAppointment(appointment.uuid, { status: AppointmentStatuses.cancelled_by_stylist });
    this.store.dispatch(new HomeLoadAction(this.activeTab.toLocaleLowerCase()));
  }

  protected async doRefresh(refresher): Promise<void> {
    await this.loadAppointments(this.activeTab);

    refresher.complete();
  }

  // swipe action for tabs
  protected slideChanged(e): void {
    this.activeTab = this.tabs[this.slides.getActiveIndex()].name;
    this.loadAppointments(this.activeTab);
  }

  private loadAppointments(tabType: string): void {
    this.activeTab = tabType;
    this.store.dispatch(new HomeLoadAction(this.activeTab.toLocaleLowerCase()));
    this.ga.trackView(`Home${this.activeTab}`);
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

    this.home = home;

    if (!this.isLoading) {
      this.tabs[index].appointments = home.appointments;
      this.tabs[index].loaded = true;
    }

    this.appointmentTags = [];

    // appointmentTags for today tab
    if (this.activeTab === this.tabs[TabNames.today].name) {
      // Create tags for each appointment based on their start/end times
      let metNext = false;
      for (const appointment of this.home.appointments) {
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
        this.appointmentTags.push(tag);
      }
    }

    // slide to needed tab
    if (this.slides) {
      const animationSpeed = 500;
      this.slides.slideTo(index, animationSpeed);
      this.content.scrollToTop(animationSpeed);
    }
  }
}
