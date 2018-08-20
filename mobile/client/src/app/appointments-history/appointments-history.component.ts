import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Refresher } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { Logger } from '~/shared/logger';
import { loading } from '~/core/utils/loading';
import { AppointmentModel, AppointmentsHistoryResponse } from '~/core/api/appointments.models';
import { ApiResponse } from '~/core/api/base.models';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';
import { PageNames } from '~/core/page-names';
import { AppointmentPageParams } from '~/appointment-page/appointment-page.component';

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
    private dataStore: AppointmentsDataStore,
    private logger: Logger,
    private navCtrl: NavController
  ) {
    this.historyObservable = this.dataStore.history.asObservable();
  }

  ionViewDidLoad(): void {
    this.logger.info('HistoryPageComponent.ionViewDidLoad');
    this.onLoad();
  }

  onLoad(): void {
    this.logger.info('HistoryPageComponent.onLoad');

    // Load the data. Indicate loading.
    loading(this, this.dataStore.history.get({ refresh: true }));
  }

  onAppointmentClick(appointment: AppointmentModel): void {
    const params: AppointmentPageParams = {
      appointment,
      hasConfirmButton: false
    };
    this.navCtrl.push(PageNames.Appointment, { params });
  }

  onRebookClick(appointment: AppointmentModel): void {
    // TODO: add rebooking logic when appointment creation flow is implemented
    this.logger.info('onRebookClick', appointment);
  }
}
