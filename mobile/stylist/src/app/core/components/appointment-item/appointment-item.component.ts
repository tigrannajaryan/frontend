import { Component, Input } from '@angular/core';

import { StylistAppointmentModel } from '~/shared/api/appointments.models';
import { formatTimeInZone } from '~/shared/utils/string-utils';

@Component({
  selector: 'appointment-item',
  templateUrl: 'appointment-item.component.html'
})
export class AppointmentItemComponent {
  formatTimeInZone = formatTimeInZone;

  @Input() appointment: StylistAppointmentModel;
  @Input() appointmentTag?: string;
  @Input() hasDate?: boolean;

  getServices(): string {
    return this.appointment.services.map(s => s.is_original ? s.service_name : '').join(', ');
  }
}
