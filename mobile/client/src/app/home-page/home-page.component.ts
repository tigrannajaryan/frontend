import { Component, ViewChild } from '@angular/core';
import { App, Content, Events, Refresher } from 'ionic-angular';

import { AppointmentStatus, ClientAppointmentModel } from '~/shared/api/appointments.models';
import { Logger } from '~/shared/logger';
import { componentUnloaded } from '~/shared/component-unloaded';
import { loading } from '~/shared/utils/loading';
import { PreferredStylistsListResponse } from '~/shared/api/stylists.models';

import { HomeResponse } from '~/core/api/appointments.models';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';
import { PageNames } from '~/core/page-names';
import { ClientEventTypes } from '~/core/client-event-types';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

import { AppointmentPageParams } from '~/appointment-page/appointment-page.component';
import { startRebooking } from '~/booking/booking-utils';
import { ProfileDataStore } from '~/profile/profile.data';

export enum AppointmentType {
  upcoming,
  past
}

@Component({
  selector: 'page-home',
  templateUrl: 'home-page.component.html'
})
export class HomePageComponent {

  AppointmentType = AppointmentType;

  // Declare refresher to make it accessible for loading() function
  @ViewChild(Refresher) refresher: Refresher;
  @ViewChild(Content) content: Content;

  homeData: HomeResponse;
  hasBookableStylist: boolean = undefined;

  isLoading: boolean;

  constructor(
    private app: App,
    private appointmentsDataStore: AppointmentsDataStore,
    private events: Events,
    private logger: Logger,
    private preferredStylistsData: PreferredStylistsData,
    private profileDataStore: ProfileDataStore
  ) {
    this.appointmentsDataStore.home.asObservable()
      .takeUntil(componentUnloaded(this))
      .subscribe(apiResponse => this.onHomeData(apiResponse.response));

    this.preferredStylistsData.asObservable()
      .takeUntil(componentUnloaded(this))
      .subscribe(apiResponse => this.onPreferredStylistData(apiResponse.response));
    this.preferredStylistsData.get();
  }

  ionViewDidLoad(): void {
    this.logger.info('HomePageComponent.ionViewDidLoad');
    this.onRefresh(false);
  }

  onHomeData(homeData: HomeResponse): void {
    this.homeData = homeData;

    // Tell the content to recalculate its dimensions. According to Ionic docs this
    // should be called after dynamically adding/removing headers, footers, or tabs.
    // See https://ionicframework.com/docs/api/components/content/Content/#resize
    if (this.content) {
      this.content.resize();
    }
  }

  onRefresh(invalidateCache = true): void {
    this.logger.info('HomePageComponent.onRefresh');

    // Refresh and load the data. Indicate loading.
    loading(this, this.appointmentsDataStore.home.get({ refresh: invalidateCache }));
    this.profileDataStore.get({ refresh: invalidateCache });
  }

  onAppointmentClick(appointment: ClientAppointmentModel, type: AppointmentType): void {
    const params: AppointmentPageParams = {
      appointment
    };

    if (type === AppointmentType.past) {
      // Can rebook past appointments
      params.hasRebook = true;
    } else if (appointment.status === AppointmentStatus.new) {
      // Can cancel appointments in 'new' state
      params.onCancel = () => this.onCancel();
    }

    this.app.getRootNav().push(PageNames.Appointment, { params });
  }

  onCancel(): void {
    this.appointmentsDataStore.home.refresh();
  }

  onRebookClick(appointment: ClientAppointmentModel): void {
    this.logger.info('onRebookClick', appointment);
    startRebooking(appointment);
  }

  onBookClick(): void {
    this.logger.info('onBookClick');
    this.events.publish(ClientEventTypes.startBooking);
  }

  onSearchClick(): void {
    this.app.getRootNav().push(PageNames.StylistSearch);
  }

  private onPreferredStylistData(response: PreferredStylistsListResponse): void {
    this.hasBookableStylist = (response && response.stylists.some(stylist => stylist.is_profile_bookable));
  }
}
