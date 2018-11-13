import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import { ApiRequestOptions } from '~/shared/api-errors';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';
import { ApiResponse } from '~/shared/api/base.models';

import {
  Appointment,
  AppointmentChangeRequest,
  AppointmentParams,
  AppointmentPreviewRequest,
  AppointmentPreviewResponse,
  HomeData,
  NewAppointmentRequest,
  OneDayAppointmentsResponse
} from './home.models';

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
  getAppointments(appointmentParams?: AppointmentParams): Observable<ApiResponse<Appointment[]>> {
    let params = new HttpParams();
    if (appointmentParams) {
      Object.keys(appointmentParams).forEach(key => {
        const param = appointmentParams[key];

        if (param instanceof Date) {
          params = params.append(key, moment(param).format('YYYY-MM-DD'));
        } else {
          params = params.append(key, param);
        }
      });
    }
    return this.get<Appointment[]>('stylist/appointments', params);
  }

  /**
   * Get all appointments. The stylist must be already authenticated as a user.
   */
  getOneDayAppointments(date: moment.Moment): Observable<ApiResponse<OneDayAppointmentsResponse>> {
    let params = new HttpParams();
    params = params.append('date', date.clone().startOf('day').format('YYYY-MM-DD'));
    return this.get<OneDayAppointmentsResponse>('stylist/appointments/oneday', params);
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
  createAppointment(data: NewAppointmentRequest, forced: boolean, options: ApiRequestOptions): Observable<ApiResponse<Appointment>> {
    return this.post<Appointment>(`stylist/appointments?force_start=${forced}`, data, undefined, options);
  }

  /**
   * Get appointment by id. The stylist must be already authenticated as a user.
   */
  getAppointmentById(appointmentUuid: string): Observable<ApiResponse<Appointment>> {
    return this.get<Appointment>(`stylist/appointments/${appointmentUuid}`);
  }

  /**
   * Change appointment by uuid.
   */
  changeAppointment(appointmentUuid: string, data: AppointmentChangeRequest): Observable<ApiResponse<Appointment>> {
    return this.post<Appointment>(`stylist/appointments/${appointmentUuid}`, data);
  }
}
