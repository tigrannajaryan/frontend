import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import { ApiRequestOptions } from '~/shared/api-errors';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseApiService } from '~/shared/stylist-api/base-api-service';
import {
  Appointment,
  AppointmentChangeRequest,
  AppointmentParams,
  AppointmentPreviewRequest,
  AppointmentPreviewResponse,
  Home,
  NewAppointmentRequest
} from './home.models';

@Injectable()
export class HomeService extends BaseApiService {

  constructor(
    protected http: HttpClient,
    protected logger: Logger,
    protected serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  /**
   * Get home page data. The stylist must be already authenticated as a user.
   */
  getHome(query: string): Promise<Home> {
    return this.get<Home>(`stylist/home?query=${encodeURIComponent(query)}`);
  }

  /**
   * Get all appointments. The stylist must be already authenticated as a user.
   */
  getAppointments(appointmentParams?: AppointmentParams): Promise<Appointment[]> {
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
   * Get appointment preview. The stylist must be already authenticated as a user.
   */
  getAppointmentPreview(data: AppointmentPreviewRequest): Promise<AppointmentPreviewResponse> {
    return this.post<AppointmentPreviewResponse>('stylist/appointments/preview', data);
  }

  /**
   * Creates new appointment. The stylist must be already authenticated as a user.
   */
  createAppointment(data: NewAppointmentRequest, forced: boolean, options: ApiRequestOptions): Promise<Appointment> {
    return this.post<Appointment>(`stylist/appointments?force_start=${forced}`, data, options);
  }

  /**
   * Get appointment by id. The stylist must be already authenticated as a user.
   */
  getAppointmentById(appointmentUuid: string): Promise<Appointment> {
    return this.get<Appointment>(`stylist/appointments/${appointmentUuid}`);
  }

  /**
   * Change appointment by uuid.
   */
  changeAppointment(appointmentUuid: string, data: AppointmentChangeRequest): Promise<Appointment> {
    return this.post<Appointment>(`stylist/appointments/${appointmentUuid}`, data);
  }
}
