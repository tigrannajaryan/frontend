import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';
import {
  AppointmentModel,
  AppointmentsHistoryResponse,
  AppointmentStatus,
  HomeResponse
} from '~/core/api/appointments.models';

@Injectable()
export class AppointmentsApi extends BaseService {

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
