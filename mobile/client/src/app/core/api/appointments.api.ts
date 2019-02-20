import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiRequestOptions } from '~/shared/api-errors';
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
import { removeParamsFormUrl } from '~/shared/utils/string-utils';

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
    return this.get<HomeResponse>('client/home')
      .map((response: ApiResponse<HomeResponse>) => {
        if (response.response && response.response.upcoming) {
          for (const item of response.response.upcoming) {
            // all our urls has unique Signature and Expires in each request
            // override url with url without params
            // to use it with trackBy function
            item.profile_photo_url = removeParamsFormUrl(item.profile_photo_url);
          }
        }
        return response;
      });
  }

  getHistory(): Observable<ApiResponse<AppointmentsHistoryResponse>> {
    return this.get<AppointmentsHistoryResponse>('client/history')
      .map((response: ApiResponse<AppointmentsHistoryResponse>) => {
        if (response.response && response.response.appointments) {
          for (const item of response.response.appointments) {
            // all our urls has unique Signature and Expires in each request
            // override url with url without params
            // to use it with trackBy function
            item.profile_photo_url = removeParamsFormUrl(item.profile_photo_url);
          }
        }
        return response;
      });
  }

  getAppointment(appointmentUuid: string): Observable<ApiResponse<ClientAppointmentModel>> {
    return this.get<ClientAppointmentModel>(`client/appointments/${appointmentUuid}`);
  }

  changeAppointment(
    appointmentUuid: string,
    data: AppointmentChangeRequest,
    options: ApiRequestOptions = {}
  ): Observable<ApiResponse<ClientAppointmentModel>> {
    return this.post<ClientAppointmentModel>(`client/appointments/${appointmentUuid}`, data, undefined, options);
  }

  updateAppointment(appointmentUuid: string, data: AppointmentChangeRequest): Observable<ApiResponse<ClientAppointmentModel>> {
    return this.patch<ClientAppointmentModel>(`client/appointments/${appointmentUuid}`, data);
  }

  cancelAppointment(appointment: ClientAppointmentModel): Observable<ApiResponse<ClientAppointmentModel>> {
    return this.changeAppointment(appointment.uuid, { status: AppointmentStatus.cancelled_by_client });
  }

  getAppointmentPreview(data: AppointmentPreviewRequest): Observable<ApiResponse<AppointmentPreviewResponse>> {
    return this.post<AppointmentPreviewResponse>('client/appointments/preview', data);
  }
}
