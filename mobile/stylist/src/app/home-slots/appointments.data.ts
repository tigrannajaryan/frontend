import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/shared/api/base.models';
import { DataStore } from '~/shared/storage/data-store';
import { DataCacheKey } from '~/core/data.module';
import { DayAppointmentsResponse } from '~/core/api/home.models';
import { HomeService } from '~/core/api/home.service';
import { Moment } from 'moment';

@Injectable()
export class AppointmentsDataStore {
  private static guardInitilization = false;
  private dataStore: DataStore<DayAppointmentsResponse>;
  private date: Moment;

  constructor(private api: HomeService) {
    if (AppointmentsDataStore.guardInitilization) {
      console.error('AppointmentsData initialized twice. Only include it in providers array of DataModule.');
    }
    AppointmentsDataStore.guardInitilization = true;

    this.dataStore = new DataStore(DataCacheKey.appointments,
      () => this.getAppointments(), { cacheTtlMilliseconds: 0 });
  }

  get(date: Moment): Promise<ApiResponse<DayAppointmentsResponse>> {
    if (!this.date || !this.date.isSame(date)) {
      this.date = date;
      this.dataStore.deleteCache();
    }
    return this.dataStore.get();
  }

  private getAppointments(): Observable<ApiResponse<DayAppointmentsResponse>> {
    return this.api.getDayAppointments(this.date);
  }
}
