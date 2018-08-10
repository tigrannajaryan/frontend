import { Component, ViewChild } from '@angular/core';
import { IonicPage, Refresher } from 'ionic-angular';
import { Observable } from 'rxjs';

import { Logger } from '~/shared/logger';
import { loading } from '~/core/utils/loading';
import { AppointmentModel, AppointmentsResponse } from '~/core/api/appointments.models';
import { ApiResponse } from '~/core/api/base.models';
import { AppointmentsHistoryDataStore } from '~/core/api/appointments-history.data';

@IonicPage()
@Component({
  selector: 'page-history-page-component',
  templateUrl: 'appointments-history.component.html'
})
export class AppointmentsHistoryComponent {

  // Declare refresher to make it accessible for loading() function
  @ViewChild(Refresher) refresher: Refresher;

  historyData: Observable<ApiResponse<AppointmentsResponse>>;
  isLoading: boolean;

  constructor(
    private dataStore: AppointmentsHistoryDataStore,
    private logger: Logger
  ) {
  }

  ionViewWillEnter(): void {
    this.logger.info('HistoryPageComponent.ionViewWillEnter');
    this.historyData = this.dataStore.asObservable();
    this.onLoad(true);
  }

  onLoad(refresh: boolean): void {
    this.logger.info('HistoryPageComponent.onLoad');

    // Load the data. Indicate loading.
    loading(this, this.dataStore.get(refresh));
  }

  onAppointmentClick(appointment: AppointmentModel): void {
    // TODO: show details of appointment
    this.logger.info('onAppointmentClick', appointment);
  }

  onRebookClick(appointment: AppointmentModel): void {
    // TODO: add rebooking logic when appointment creation flow is implemented
    this.logger.info('onRebookClick', appointment);
  }
}
