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

  /**
   * Get today page data. The stylist must be already authenticated as a user.
   */
  getToday(): Promise<Today> {
    return this.get<Today>('stylist/today');
  }

  /**
   * Get all appointments. The stylist must be already authenticated as a user.
   */
  getAppointments(): Promise<Appointment[]> {
    return this.get<Appointment[]>('stylist/appointments');
  }

  /**
   * Get appointment by id. The stylist must be already authenticated as a user.
   */
  getAppointmentById(appointmentUuid: string): Promise<Appointment> {
    return this.get<Appointment>(`stylist/appointments/${appointmentUuid}`);
  }

  /**
   * Set appointment by id. The stylist must be already authenticated as a user.
   */
  setAppointment(appointmentUuid: string, data: AppointmentStatus): Promise<AppointmentStatus[]> {
    return this.post<AppointmentStatus[]>(`stylist/appointments/${appointmentUuid}`, data);
  }
}
