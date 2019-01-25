import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';

import { ApiRequestOptions } from '~/shared/api-errors';
import { BaseService } from '~/shared/api/base.service';
import { ApiResponse, isoDateFormat } from '~/shared/api/base.models';
import {
  AppointmentChangeRequest,
  AppointmentPreviewRequest,
  AppointmentPreviewResponse,
  StylistAppointmentModel
} from '~/shared/api/appointments.models';

import {
  AppointmentParams,
  DatesWithAppointmentsParams,
  DatesWithAppointmentsResponse,
  DayAppointmentsResponse,
  HomeData,
  NewAppointmentRequest
} from '~/core/api/home.models';

@Injectable()
export class HomeService extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  /**
   * Get home page data. The stylist must be already authenticated as a user.
   */
  getHome(query: string): Observable<ApiResponse<HomeData>> {
    return this.get<HomeData>(`stylist/home?query=${encodeURIComponent(query)}`);
  }

  /**
   * Get all appointments. The stylist must be already authenticated as a user.
   */
  getAppointments(appointmentParams?: AppointmentParams): Observable<ApiResponse<StylistAppointmentModel[]>> {
    let params = new HttpParams();
    if (appointmentParams) {
      Object.keys(appointmentParams).forEach(key => {
        const param = appointmentParams[key];

        if (param instanceof Date) {
          params = params.append(key, moment(param).format(isoDateFormat));
        } else {
          params = params.append(key, param);
        }
      });
    }
    return this.get<StylistAppointmentModel[]>('stylist/appointments', params);
  }

  /**
   * Get dates with appointments.
   */
  getDatesWithAppointments(appointmentParams?: DatesWithAppointmentsParams): Observable<ApiResponse<DatesWithAppointmentsResponse>> {
    let params = new HttpParams();
    if (appointmentParams) {
      Object.keys(appointmentParams).forEach(key => {
        const param = appointmentParams[key];

        if (param instanceof Date) {
          params = params.append(key, moment(param).format(isoDateFormat));
        } else {
          params = params.append(key, param);
        }
      });
    }
    return this.get<DatesWithAppointmentsResponse>('stylist/appointments/dates-with-appointments', params);
  }

  /**
   * Get appointments for one day.
   */
  getDayAppointments(date: moment.Moment): Observable<ApiResponse<DayAppointmentsResponse>> {
    let params = new HttpParams();
    params = params.append('date', date.clone().startOf('day').format(isoDateFormat));
    return this.get<DayAppointmentsResponse>('stylist/appointments/oneday', params);
  }

  /**
   * Get appointment preview. The stylist must be already authenticated as a user.
   */
  getAppointmentPreview(data: AppointmentPreviewRequest): Observable<ApiResponse<AppointmentPreviewResponse>> {
    return this.post<AppointmentPreviewResponse>('stylist/appointments/preview', data);
  }

  /**
   * Creates new appointment. The stylist must be already authenticated as a user.
   */
  createAppointment(data: NewAppointmentRequest, forced: boolean, options: ApiRequestOptions
    ): Observable<ApiResponse<StylistAppointmentModel>> {
      return this.post<StylistAppointmentModel>(`stylist/appointments?force_start=${forced}`, data, undefined, options);
  }

  /**
   * Get appointment by id. The stylist must be already authenticated as a user.
   */
  getAppointmentById(appointmentUuid: string): Observable<ApiResponse<StylistAppointmentModel>> {
    return this.get<StylistAppointmentModel>(`stylist/appointments/${appointmentUuid}`);
  }

  /**
   * Change appointment by uuid.
   */
  changeAppointment(appointmentUuid: string, data: AppointmentChangeRequest): Observable<ApiResponse<StylistAppointmentModel>> {
    return this.post<StylistAppointmentModel>(`stylist/appointments/${appointmentUuid}`, data);
  }
}
