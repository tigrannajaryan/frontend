import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';
import { GetPricelistResponse, ServiceModel } from '~/core/api/services.models';
import { AppointmentModel } from '~/core/api/appointments.models';
import { ApiRequestOptions } from '~/shared/api-errors';

type ISODateTime = string;

interface TimeslotModel {
  start: ISODateTime; // ISO 8601 date and time
  end: ISODateTime; // ISO 8601 date and time
  is_booked: boolean;
}

export interface TimeslotsResponse {
  time_slots: TimeslotModel[];
}

interface AppointmentRequestService {
  service_uuid: string;
}

export interface CreateAppointmentRequest {
  stylist_uuid: string;
  datetime_start_at: ISODateTime;
  services: AppointmentRequestService[];
}

@Injectable()
export class BookingApi extends BaseService {

  getTimeslots(stylistUuid: string, date: moment.Moment): Observable<ApiResponse<TimeslotsResponse>> {
    const params = {
      date: date.format('YYYY-MM-DD'),
      stylist_uuid: stylistUuid
    };
    return this.post<TimeslotsResponse>('client/available-times', params);
  }

  getPricelist(services: ServiceModel[], options?: ApiRequestOptions): Observable<ApiResponse<GetPricelistResponse>> {
    const data = {
      // TODO: this is the correct code: service_uuid: services.map(service => service.uuid),
      // But temporarily using the following until API is fixed.
      service_uuids: services.map(service => service.uuid)
    };
    return this.post<GetPricelistResponse>('client/services/pricing', data, undefined, options);
  }

  createAppointment(appointment: CreateAppointmentRequest): Observable<ApiResponse<AppointmentModel>> {
    return this.post<AppointmentModel>('client/appointments', appointment);
  }

  previewAppointment(appointment: CreateAppointmentRequest): Observable<ApiResponse<AppointmentModel>> {
    return this.post<AppointmentModel>('client/appointments/preview', appointment);
  }
}
