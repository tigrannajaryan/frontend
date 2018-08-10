import { Component, ViewChild } from '@angular/core';
import { IonicPage, Refresher } from 'ionic-angular';
import { Observable } from 'rxjs';

import { Logger } from '~/shared/logger';
import { loading } from '~/core/utils/loading';
import { AppointmentModel, HomeResponse } from '~/core/api/appointments.models';
import { ApiResponse } from '~/core/api/base.models';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home-page.component.html'
})
export class HomePageComponent {

  // Declare refresher to make it accessible for loading() function
  @ViewChild(Refresher) refresher: Refresher;

  homeObservable: Observable<ApiResponse<HomeResponse>>;
  isLoading: boolean;

  constructor(
    private dataStore: AppointmentsDataStore,
    private logger: Logger
  ) {
    this.homeObservable = this.dataStore.home.asObservable();
  }

  ionViewWillEnter(): void {
    this.logger.info('HomePageComponent.ionViewWillEnter');
    this.onLoad();
  }

  onLoad(): void {
    this.logger.info('HomePageComponent.onLoad');

    // Load the data. Indicate loading.
    loading(this, this.dataStore.home.get({ refresh: true }));
  }

  onAppointmentClick(appointment: AppointmentModel): void {
    // TODO: show details of appointment
    this.logger.info('onAppointmentClick', appointment);
  }

  onRebookClick(appointment: AppointmentModel): void {
    // TODO: add rebooking logic when appointment creation flow is implemented
    this.logger.info('onRebookClick', appointment);
  }

  onBoockClick(): void {
    // TODO: add booking logic when appointment creation flow is implemented
    this.logger.info('onBookClick');
  }
}
