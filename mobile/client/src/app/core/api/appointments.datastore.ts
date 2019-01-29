import { Injectable } from '@angular/core';

import { DataStore } from '~/shared/storage/data-store';
import { Logger } from '~/shared/logger';

import { AppointmentsHistoryResponse, HomeResponse } from '~/core/api/appointments.models';
import { AppointmentsApi } from '~/core/api/appointments.api';

/**
 * Singleton that stores appointment data.
 */
@Injectable()
export class AppointmentsDataStore {
  private static guardInitilization = false;

  readonly history: DataStore<AppointmentsHistoryResponse>;
  readonly home: DataStore<HomeResponse>;

  constructor(
    api: AppointmentsApi,
    logger: Logger
  ) {
    if (AppointmentsDataStore.guardInitilization) {
      logger.error('AppointmentsDataStore initialized twice. Only include it in providers array of DataModule.');
    }
    AppointmentsDataStore.guardInitilization = true;

    this.history = new DataStore('history', () => api.getHistory(),
      { cacheTtlMilliseconds: 0 }); // 0 cache ttl for data that can be externally modified

    this.home = new DataStore('home', () => api.getHome(),
      { cacheTtlMilliseconds: 0 });
  }
}
