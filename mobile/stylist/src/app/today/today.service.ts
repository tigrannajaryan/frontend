import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppointmentStatus, Today } from './today.models';
import { Logger } from '../shared/logger';
import { BaseServiceProvider } from '../shared/base-service';

@Injectable()
export class TodayService extends BaseServiceProvider {

  constructor(
    public http: HttpClient,
    public logger: Logger) {
    super(http, logger);
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
