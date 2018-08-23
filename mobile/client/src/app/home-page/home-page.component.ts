import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Refresher } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { Logger } from '~/shared/logger';
import { loading } from '~/core/utils/loading';
import { AppointmentModel, HomeResponse } from '~/core/api/appointments.models';
import { ApiResponse } from '~/core/api/base.models';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';
import { PageNames } from '~/core/page-names';
import { AppointmentPageParams } from '~/appointment-page/appointment-page.component';
import { startRebooking } from '~/booking/booking-utils';

enum AppointmentType {
  upcoming,
  past
}

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home-page.component.html'
})
export class HomePageComponent {

  AppointmentType = AppointmentType;

  // Declare refresher to make it accessible for loading() function
  @ViewChild(Refresher) refresher: Refresher;

  homeObservable: Observable<ApiResponse<HomeResponse>>;
  isLoading: boolean;

  constructor(
    private dataStore: AppointmentsDataStore,
    private logger: Logger,
    private navCtrl: NavController
  ) {
    this.homeObservable = this.dataStore.home.asObservable();
  }

  ionViewDidLoad(): void {
    this.logger.info('HomePageComponent.ionViewDidLoad');

    // When loading the first time perform full refresh
    this.onRefresh();
  }

  ionViewWillEnter(): void {
    this.logger.info('HomePageComponent.ionViewWillEnter');
    // Trigger loading of data via this.homeObservable
    this.dataStore.home.get({ refresh: false });
  }

  onRefresh(): void {
    this.logger.info('HomePageComponent.onRefresh');

    // Refresh and load the data. Indicate loading.
    loading(this, this.dataStore.home.get({ refresh: true }));
  }

  onAppointmentClick(appointment: AppointmentModel, type: AppointmentType): void {
    const params: AppointmentPageParams = {
      appointment
    };

    if (type === AppointmentType.past) {
      params.hasRebook = true;
    } else {
      params.onCancel = () => this.onCancel();
    }

    this.navCtrl.push(PageNames.Appointment, { params });
  }

  onCancel(): void {
    this.dataStore.home.get({ refresh: true });
  }

  onRebookClick(appointment: AppointmentModel): void {
    this.logger.info('onRebookClick', appointment);
    startRebooking(appointment, this.navCtrl);
  }

  onBookClick(): void {
    this.logger.info('onBookClick');

    // Begin booking process by showing service categories selection screen
    this.navCtrl.push(PageNames.ServicesCategories);
  }
}
