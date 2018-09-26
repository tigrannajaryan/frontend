import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base-service';
import {
  AppointmentModel,
  AppointmentsHistoryResponse,
  AppointmentStatus,
  HomeResponse
} from '~/core/api/appointments.models';

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

  cancelAppointment(appointment: AppointmentModel): Observable<ApiResponse<AppointmentModel>> {
    const data = {
      status: AppointmentStatus.cancelled_by_client
    };
    return this.post<AppointmentModel>(`client/appointments/${appointment.uuid}`, data);
  }
}
