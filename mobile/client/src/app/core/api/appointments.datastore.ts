import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { DataStore } from '~/core/utils/data-store';
import { AppointmentsHistoryResponse, HomeResponse } from '~/core/api/appointments.models';
import { AppointmentsApi } from '~/core/api/appointments.api';

/**
 * Singleton that stores appointment data.
 */
@Injectable()
export class AppointmentsDataStore {
  readonly history: DataStore<AppointmentsHistoryResponse>;
  readonly home: DataStore<HomeResponse>;

  constructor(api: AppointmentsApi) {
    const ttl1hour = moment.duration(1, 'hour').asMilliseconds();

    this.history = new DataStore('history', () => api.getHistory(),
      { cacheTtlMilliseconds: ttl1hour });

    this.home = new DataStore('home', () => api.getHome(),
      { cacheTtlMilliseconds: ttl1hour });
  }
}
