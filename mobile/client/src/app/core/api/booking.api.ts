import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';
import { ServiceModel } from '~/core/api/services.models';

type ISODateTime = string;

interface TimeslotModel {
  start: ISODateTime; // ISO 8601 date and time
  end: ISODateTime; // ISO 8601 date and time
}

export interface TimeslotsResponse {
  time_slots: TimeslotModel[];
  service_gap_minutes: number;
  day_start: ISODateTime;
  day_end: ISODateTime;
}

// tslint:disable-next-line:no-empty-interface
export interface PricelistResponse {
  // Temporary interface just to compile this file
}

@Injectable()
export class BookingApi extends BaseService {

  getTimeslots(stylistUuid: string, date: Date): Observable<ApiResponse<TimeslotsResponse>> {
    const params = {
      date: moment(date).format('YYYY-MM-DD'),
      stylist_uuid: stylistUuid
    };
    return this.post<TimeslotsResponse>('client/available-times', params);
  }

  getPricelist(stylistUuid: string, selectedServices: ServiceModel[]): Observable<ApiResponse<PricelistResponse>> {
    const params = {
      service_uuid: selectedServices,
      stylist_uuid: stylistUuid
    };
    return this.post<PricelistResponse>('client/services/pricing', params);
  }
}
