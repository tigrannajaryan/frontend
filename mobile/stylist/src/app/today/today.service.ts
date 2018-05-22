import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from '~/shared/base-api-service';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { Appointment, AppointmentStatus, Today } from '~/today/today.models';

@Injectable()
export class TodayService extends BaseApiService {

  constructor(
    protected http: HttpClient,
    protected logger: Logger,
    protected serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getAppointments(): Promise<Appointment[]> {
    return this.get<Appointment[]>('/appointments');
  }

  getToday(): Promise<Today> {
    return this.get<Today>('/stylist/today');
  }

  setAppointment(appointmentUuid: string, data: AppointmentStatus): Promise<AppointmentStatus[]> {
    return this.post<AppointmentStatus[]>(`/appointments/${appointmentUuid}`, data);
  }
}
