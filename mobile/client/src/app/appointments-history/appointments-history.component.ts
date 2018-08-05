import { Component, ViewChild } from '@angular/core';
import { IonicPage, Refresher } from 'ionic-angular';

import { Logger } from '~/shared/logger';
import { ApiError } from '~/core/api/errors.models';
import { PageNames } from '~/core/page-names';
import { AppointmentModel } from '~/core/api/appointments.models';
// import { AppointmentsHistoryApi } from './appointments-history.api';
import { AppointmentsHistoryApiMock } from './appointments-history.api.mock'; // For debugging only

import { cached, composeRequest, loading, withRefresher } from '~/core/utils/request-utils';

@IonicPage()
@Component({
  selector: 'page-history',
  templateUrl: 'appointments-history.component.html'
})
export class AppointmentsHistoryComponent {

  // Declare refresher to make it accessible for loading() function
  @ViewChild(Refresher) refresher: Refresher;

  appointments: AppointmentModel[];
  errors: ApiError[];
  isLoading: boolean;

  constructor(
    private historyApi: AppointmentsHistoryApiMock, // For debugging only
    private logger: Logger
  ) {
  }

  ionViewWillEnter(): void {
    this.logger.info('HistoryPageComponent.ionViewWillEnter');
    this.onLoad();
  }

  async onLoad(): Promise<void> {
    this.logger.info('HistoryPageComponent.onLoad');

    // Load the data. Indicate loading and cache loaded data. By convention we use page name as the cache key.
    const { response, errors } = await composeRequest(
      cached(PageNames.AppointmentsHistory, { forced: this.refresher.state === 'refreshing' }),
      loading(this),
      withRefresher(this.refresher),
      this.historyApi.getHistory()
    );

    this.appointments = response && response.appointments;
    this.errors = errors;
  }

  onAppointmentClick(appointment): void {
    // TODO: show details of appointment
    this.logger.info('onAppointmentClick', appointment);
  }

  onRebookClick(appointment): void {
    // TODO: add rebooking logic when appointment creation flow is implemented
    this.logger.info('onRebookClick', appointment);
  }
}
