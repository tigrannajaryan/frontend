import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClientAppointmentModel } from '~/shared/api/appointments.models';
import { formatTimeInZone } from '~/shared/utils/string-utils';
import { confirmRebook } from '~/booking/booking-utils';

/**
 * A component that shows a single appointment item (card). Used by Home and History screens.
 */
@Component({
  selector: 'appointment-item',
  templateUrl: 'appointment-item.component.html'
})
export class AppointmentItemComponent {
  formatTimeInZone = formatTimeInZone;

  @Input() appointment: ClientAppointmentModel;
  @Input() hasRebook: boolean;

  @Output() cardClick = new EventEmitter<ClientAppointmentModel>();
  @Output() rebookClick = new EventEmitter<ClientAppointmentModel>();

  getServices(): string {
    return this.appointment.services.map(s => s.service_name).join(', ');
  }

  onCardClick(): void {
    this.cardClick.emit(this.appointment);
  }

  async onRebookClick(): Promise<void> {
    const isConfirmed = await confirmRebook(this.appointment);
    if (isConfirmed) {
      this.rebookClick.emit(this.appointment);
    }
  }
}
