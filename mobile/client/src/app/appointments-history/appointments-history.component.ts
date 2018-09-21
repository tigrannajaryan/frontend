import { Component, ViewChild } from '@angular/core';
import { App, IonicPage, Refresher } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { Logger } from '~/shared/logger';
import { loading } from '~/shared/utils/loading';

import { AppointmentModel, AppointmentsHistoryResponse } from '~/core/api/appointments.models';
import { ApiResponse } from '~/core/api/base.models';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';
import { PageNames } from '~/core/page-names';
import { AppointmentPageParams } from '~/appointment-page/appointment-page.component';
import { startRebooking } from '~/booking/booking-utils';
import { ProfileDataStore } from '~/profile/profile.data';

@IonicPage()
@Component({
  selector: 'page-history',
  templateUrl: 'appointments-history.component.html'
})
export class AppointmentsHistoryComponent {

  // Declare refresher to make it accessible for loading() function
  @ViewChild(Refresher) refresher: Refresher;

  historyObservable: Observable<ApiResponse<AppointmentsHistoryResponse>>;
  isLoading: boolean;

  constructor(
    private app: App,
    private appointmentsDataStore: AppointmentsDataStore,
    private logger: Logger,
    private profileDataStore: ProfileDataStore
  ) {
    this.historyObservable = this.appointmentsDataStore.history.asObservable();
  }

  ionViewDidLoad(): void {
    this.logger.info('HistoryPageComponent.ionViewDidLoad');
    this.onRefresh(false);
  }

  onRefresh(invalidateCache = true): void {
    this.logger.info('HistoryPageComponent.onLoad');

    // Load the data. Indicate loading.
    loading(this, this.appointmentsDataStore.history.get({ refresh: invalidateCache }));
    this.profileDataStore.get({ refresh: invalidateCache });
  }

  onAppointmentClick(appointment: AppointmentModel): void {
    const params: AppointmentPageParams = {
      appointment,
      hasRebook: true
    };
    this.app.getRootNav().push(PageNames.Appointment, { params });
  }

  onRebookClick(appointment: AppointmentModel): void {
    this.logger.info('onRebookClick', appointment);
    startRebooking(appointment);
  }
}
