import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';
import {
  AppointmentChangeRequest,
  AppointmentPreviewRequest,
  AppointmentPreviewResponse,
  AppointmentStatus,
  ClientAppointmentModel
} from '~/shared/api/appointments.models';
import { AppointmentsHistoryResponse, HomeResponse } from '~/core/api/appointments.models';

@Injectable()
export class AppointmentsApi extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getHome(): Observable<ApiResponse<HomeResponse>> {
    return this.get<HomeResponse>('client/home');
  }

  getHistory(): Observable<ApiResponse<AppointmentsHistoryResponse>> {
    return this.get<AppointmentsHistoryResponse>('client/history');
  }

  getAppointment(appointmentUuid: string): Observable<ApiResponse<ClientAppointmentModel>> {
    return this.get<ClientAppointmentModel>(`client/appointments/${appointmentUuid}`);
  }

  changeAppointment(appointmentUuid: string, data: AppointmentChangeRequest): Observable<ApiResponse<ClientAppointmentModel>> {
    return this.post<ClientAppointmentModel>(`client/appointments/${appointmentUuid}`, data);
  }

  cancelAppointment(appointment: ClientAppointmentModel): Observable<ApiResponse<ClientAppointmentModel>> {
    return this.changeAppointment(appointment.uuid, { status: AppointmentStatus.cancelled_by_client });
  }

  getAppointmentPreview(data: AppointmentPreviewRequest): Observable<ApiResponse<AppointmentPreviewResponse>> {
    return this.post<AppointmentPreviewResponse>('client/appointments/preview', data);
  }
}
