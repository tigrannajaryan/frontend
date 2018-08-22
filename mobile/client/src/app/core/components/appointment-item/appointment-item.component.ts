import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AppointmentModel, AppointmentStatus } from '~/core/api/appointments.models';
import { formatTimeInZone } from '~/shared/utils/string-utils';

/**
 * A component that shows a single appointment item (card). Used by Home and History screens.
 */
@Component({
  selector: 'appointment-item',
  templateUrl: 'appointment-item.component.html'
})
export class AppointmentItemComponent {

  AppointmentStatus = AppointmentStatus;
  formatTimeInZone = formatTimeInZone;

  @Input()
  appointment: AppointmentModel;

  @Output()
  cardClick = new EventEmitter<AppointmentModel>();

  @Output()
  rebookClick = new EventEmitter<AppointmentModel>();

  @Input()
  hasRebook: boolean;

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
