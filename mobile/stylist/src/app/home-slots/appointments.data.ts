import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { DataStore } from '~/shared/storage/data-store';
import { DataCacheKey } from '~/core/data.module';
import { OneDayAppointmentsResponse } from '~/core/api/home.models';
import { HomeService } from '~/core/api/home.service';
import { Moment } from 'moment';

@Injectable()
export class AppointmentsDataStore {
  private static guardInitilization = false;
  private dataStore: DataStore<OneDayAppointmentsResponse>;
  private date: Moment;

  constructor(private api: HomeService) {
    if (AppointmentsDataStore.guardInitilization) {
      console.error('AppointmentsData initialized twice. Only include it in providers array of DataModule.');
    }
    AppointmentsDataStore.guardInitilization = true;

    this.dataStore = new DataStore(DataCacheKey.appointments,
      () => this.getAppointments(), { cacheTtlMilliseconds: 0 });
  }

  get(date: Moment): Promise<ApiResponse<OneDayAppointmentsResponse>> {
    if (!this.date || !this.date.isSame(date)) {
      this.date = date;
      this.dataStore.clear();
    }
    return this.dataStore.get();
  }

  private getAppointments(): Observable<ApiResponse<OneDayAppointmentsResponse>> {
    return this.api.getOneDayAppointments(this.date);
  }
}
