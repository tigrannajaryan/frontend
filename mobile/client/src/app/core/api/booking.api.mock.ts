import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/core/api/base.models';
import { PricelistResponse, TimeslotsResponse } from './booking.api';
import { ServiceModel } from '~/core/api/services.models';

@Injectable()
export class BookingApiMock {

  getTimeslots(stylistUuid: string, date: Date): Observable<ApiResponse<TimeslotsResponse>> {
    const response: TimeslotsResponse = {
      time_slots: [{
        start: '2018-08-18T09:00:00-06:00',
        end: '2018-06-18T09:30:00-06:00',
        is_booked: false
      },
      {
        start: '2018-08-18T10:00:00-06:00',
        end: '2018-06-18T10:30:00-06:00',
        is_booked: true
      },
      {
        start: '2018-08-18T10:30:00-06:00',
        end: '2018-06-18T11:00:00-06:00',
        is_booked: false
      },
      {
        start: '2018-08-18T12:00:00-06:00',
        end: '2018-06-18T12:30:00-06:00',
        is_booked: false
      },
      {
        start: '2018-08-18T12:30:00-06:00',
        end: '2018-06-18T13:00:00-06:00',
        is_booked: true
      },
      {
        start: '2018-08-18T13:30:00-06:00',
        end: '2018-06-18T14:00:00-06:00',
        is_booked: false
      },
      {
        start: '2018-08-18T14:00:00-06:00',
        end: '2018-06-18T14:30:00-06:00',
        is_booked: false
      },
      {
        start: '2018-08-18T15:00:00-06:00',
        end: '2018-06-18T15:30:00-06:00',
        is_booked: false
      }]
    };
    return Observable.of({ response });
  }

  getPricelist(stylistUuid: string, selectedServices: ServiceModel[]): Observable<ApiResponse<PricelistResponse>> {
    const response = {};
    return Observable.of({ response });
  }
}
