import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AppointmentModel, AppointmentStatus } from '~/core/api/appointments.models';
import { formatTimeInZone } from '~/shared/utils/string-utils';

import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

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

  preferredStylistsUuids: Promise<string[]>;

  @Input() appointment: AppointmentModel;
  @Input() hasRebook: boolean;

  @Output() cardClick = new EventEmitter<AppointmentModel>();
  @Output() rebookClick = new EventEmitter<AppointmentModel>();

  constructor(
    private preferredStylistsData: PreferredStylistsData
  ) {
    this.preferredStylistsUuids = this.preferredStylistsData.get()
      .then(stylists => stylists.map(stylist => stylist.uuid));
  }

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
