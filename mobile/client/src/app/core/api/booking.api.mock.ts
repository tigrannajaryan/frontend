import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { ApiResponse } from '~/shared/api/base.models';
import { ServiceModel } from '~/shared/api/price.models';
import { BookingApi, TimeslotsResponse } from './booking.api';
import { GetPricelistResponse } from '~/core/api/services.models';

@Injectable()
export class BookingApiMock extends BookingApi {

  constructor() {
    super(undefined, undefined, undefined);
  }

  getTimeslots(stylistUuid: string, date: moment.Moment): Observable<ApiResponse<TimeslotsResponse>> {
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

  getPricelist(selectedServices: ServiceModel[]): Observable<ApiResponse<GetPricelistResponse>> {
    const response = {
      stylist_uuid: 'abc',
      service_uuid: 'def',
      prices: [{
        date: '2018-01-01',
        price: 123,
        is_fully_booked: false,
        is_working_day: true
      }]
    };
    return Observable.of({ response });
  }
}
