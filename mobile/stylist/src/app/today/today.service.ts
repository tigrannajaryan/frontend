import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiService } from '~/shared/base-api-service';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import {
  Appointment,
  AppointmentChangeRequest,
  AppointmentPreviewRequest,
  AppointmentPreviewResponse,
  NewAppointmentRequest,
  Today
} from '~/today/today.models';

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
   * Get appointment preview. The stylist must be already authenticated as a user.
   */
  getAppointmentPreview(data: AppointmentPreviewRequest): Promise<AppointmentPreviewResponse> {
    return this.post<AppointmentPreviewResponse>('stylist/appointments/preview', data);
  }

  /**
   * Creates new appointment. The stylist must be already authenticated as a user.
   */
  createAppointment(data: NewAppointmentRequest, forced = false): Promise<Appointment> {
    return this.post<Appointment>(`stylist/appointments?force_start=${forced}`, data);
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
