import { Injectable } from '@angular/core';

import { DataStore } from '~/core/utils/data-store';
import { AppointmentsHistoryResponse, HomeResponse } from '~/core/api/appointments.models';
import { AppointmentsApiMock } from '~/core/api/appointments.api.mock';

/**
 * Singleton that stores appointment data.
 */
@Injectable()
export class AppointmentsDataStore {
  readonly history: DataStore<AppointmentsHistoryResponse>;
  readonly home: DataStore<HomeResponse>;

  constructor(api: AppointmentsApiMock) {
    this.history = new DataStore('history', () => api.getHistory());
    this.home = new DataStore('home', () => api.getHome());
  }
}
