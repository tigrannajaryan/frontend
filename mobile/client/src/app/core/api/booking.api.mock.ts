import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/core/api/base.models';
import { PricelistResponse, TimeslotsResponse } from './booking.api';
import { ServiceModel } from '~/core/api/services.models';

@Injectable()
export class BookingApiMock {

  getTimeslots(stylistUuid: string, date: Date): Observable<ApiResponse<TimeslotsResponse>> {
    const response: TimeslotsResponse = {
      time_slots: Array(1).fill(undefined).map(() => ({
        start: '11:00',
        end: '12:00'
      })),
      service_gap_minutes: 30,
      day_start: '08:00',
      day_end: '17:00'
    };
    return Observable.of({ response });
  }

  getPricelist(stylistUuid: string, selectedServices: ServiceModel[]): Observable<ApiResponse<PricelistResponse>> {
    const response = {};
    return Observable.of({ response });
  }
}
