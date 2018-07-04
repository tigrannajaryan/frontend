import { Component, Input } from '@angular/core';
import { Appointment } from '~/home/home.models';

@Component({
  selector: 'appointment-item',
  templateUrl: 'appointment-item.component.html'
})
export class AppointmentItemComponent {
  @Input() appointment: Appointment;
  @Input() appointmentTag?: string;
  @Input() hasDate?: boolean;
}
