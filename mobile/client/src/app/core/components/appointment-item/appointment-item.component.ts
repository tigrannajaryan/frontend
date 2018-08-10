import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AppointmentModel, AppointmentStatus } from '~/core/api/appointments.models';

/**
 * A component that shows a single appointment item (card). Used by Home and History screens.
 */
@Component({
  selector: 'appointment-item',
  templateUrl: 'appointment-item.component.html'
})
export class AppointmentItemComponent {

  AppointmentStatus = AppointmentStatus;

  @Input()
  appointment: AppointmentModel;

  @Output()
  cardClick = new EventEmitter<AppointmentModel>();

  @Output()
  rebookClick = new EventEmitter<AppointmentModel>();

  getServices(): string {
    return this.appointment.services.map(s => s.service_name).join(', ');
  }

  onCardClick(): void {
    this.cardClick.emit(this.appointment);
  }

  onRebookClick(): void {
    this.rebookClick.emit(this.appointment);
  }
}
