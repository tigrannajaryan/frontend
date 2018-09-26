import { Component, Input } from '@angular/core';

import { Appointment } from '~/shared/stylist-api/home.models';
import { formatTimeInZone } from '~/shared/utils/string-utils';

@Component({
  selector: 'appointment-item',
  templateUrl: 'appointment-item.component.html'
})
export class AppointmentItemComponent {
  formatTimeInZone = formatTimeInZone;

  @Input() appointment: Appointment;
  @Input() appointmentTag?: string;
  @Input() hasDate?: boolean;

  getServices(): string {
    return this.appointment.services.map(s => s.is_original ? s.service_name : '').join(', ');
  }
}
