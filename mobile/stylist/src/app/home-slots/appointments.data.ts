import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { DataStore } from '~/shared/storage/data-store';
import { DataCacheKey } from '~/core/data.module';
import { Appointment, AppointmentParams } from '~/core/api/home.models';
import { HomeService } from '~/core/api/home.service';

@Injectable()
export class AppointmentsDataStore {
  private static guardInitilization = false;
  private dataStore: DataStore<Appointment[]>;
  private date: Date;

  constructor(private api: HomeService) {
    if (AppointmentsDataStore.guardInitilization) {
      console.error('AppointmentsData initialized twice. Only include it in providers array of DataModule.');
    }
    AppointmentsDataStore.guardInitilization = true;

    this.dataStore = new DataStore(DataCacheKey.appointments,
      () => this.getAppointments(), { cacheTtlMilliseconds: 0 });
  }

  get(date: Date): Promise<ApiResponse<Appointment[]>> {
    if (this.date !== date) {
      this.date = date;
      this.dataStore.clear();
    }
    return this.dataStore.get();
  }

  private getAppointments(): Observable<ApiResponse<Appointment[]>> {
    const params: AppointmentParams = {
      date_from: this.date,
      date_to: this.date,
      include_cancelled: true
    };
    return this.api.getAppointments(params);
  }
}
