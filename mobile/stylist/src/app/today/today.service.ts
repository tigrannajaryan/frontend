import { Injectable } from '@angular/core';
import { AppointmentStatus, Today } from './today.models';
import { BaseApiService } from '../shared/base-api-service';
import { HttpClient } from '@angular/common/http';
import { Logger } from '../shared/logger';
import { ServerStatusTracker } from '../shared/server-status-tracker';

@Injectable()
export class TodayService extends BaseApiService {

  constructor(
    protected http: HttpClient,
    protected logger: Logger,
    protected serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getAppointments(): Promise<AppointmentStatus[]> {
    return this.get<AppointmentStatus[]>('/appointments');
  }

  load(): Promise<Today> {
    // TODO: return this.get<Today>('/today');

    const today: Today = {
      appointments: [
        { appointmentUuid: '', start_time: '1:00', duration_sec: 600, client_name: 'John White' }
      ]
    };

    return Promise.resolve(today);
  }

  checkin(appointmentUuid: string): Promise<Today> {
    // TODO: this.patch<Today>('/appointment/'+appointmentUuid+', { checkin: true });

    const today: Today = {
      appointments: [
        { appointmentUuid: '', start_time: '1:00', duration_sec: 600, client_name: 'John White (checked in)' }
      ]
    };

    return Promise.resolve(today);
  }
}
