import { Component, Input } from '@angular/core';
import * as moment from 'moment';

import { AppointmentStatus, StylistAppointmentModel } from '~/shared/api/appointments.models';

import { TimeSlotItem } from '~/home-slots/time-slots/time-slots.component';

/**
 * Calculate and return end time of the appointment
 */
export function getAppointmentEndMoment(appointment: StylistAppointmentModel): moment.Moment {
  const start = moment(appointment.datetime_start_at);
  return start.add(appointment.duration_minutes, 'minutes');
}

/**
 * Returns an Object with keys as CSS class names in a way that is defind by ngClass
 * Angular directive: https://angular.io/api/common/NgClass
 * Used for styling appointment slots.
 */
export function getAppointmentCssClasses(appointment: StylistAppointmentModel): Object {
  const now = moment();
  return {
    TimeSlotNew: appointment.status === AppointmentStatus.new,
    TimeSlotCancelled: appointment.status === AppointmentStatus.cancelled_by_client,
    TimeSlotPast: getAppointmentEndMoment(appointment).isBefore(now)
  };
}

/**
 * Returns the appropriate icon url for the appointment depending on the
 * state of the appointment.
 */
export function getAppointmentIconUrl(appointment: StylistAppointmentModel): string {
  if (appointment.status === AppointmentStatus.no_show) {
    return 'assets/icons/appointment/no-show@3x.png';
  } else if (isAppointmentPendingCheckout(appointment)) {
    return 'assets/icons/appointment/pending-checkout@3x.png';
  } else if (appointment.client_profile_photo_url) {
    return appointment.client_profile_photo_url;
  } else {
    return 'assets/icons/stylist-avatar.png';
  }
}

/**
 * Calculate appointment is fresh. Fresh appointment is not checked out.
 */
export function isAppointmentPendingCheckout(appointment: StylistAppointmentModel): boolean {
  if (appointment.status === AppointmentStatus.new) {
    const end = getAppointmentEndMoment(appointment);
    if (end.isBefore(moment())) {
      return true;
    }
  }
  return false;
}

/**
 * Return true if the appointment is just a blocked time and not a real appointment.
 */
export function isBlockedTime(appointment: StylistAppointmentModel): boolean {
  return !appointment.client_uuid &&
    !appointment.client_first_name &&
    !appointment.client_last_name &&
    !appointment.client_phone;
}

/**
 * Format client name and return as string. Will use first/last if it is known
 * otherwise will return phone instead of the name.
 */
export function formatAppointmentClientName(appointment: StylistAppointmentModel): string {
  let str = appointment.client_first_name.trim();
  if (appointment.client_last_name.trim()) {
    // Add last name if it is known
    if (str.length) {
      str = `${str} `;
    }
    str = `${str}${appointment.client_last_name.trim()}`;
  }
  if (!str && appointment.client_phone.trim()) {
    // Use phone number if name is missing
    str = appointment.client_phone.trim();
  }
  return str;
}

/**
 * Format a list of services as a comman separated string
 */
export function formatAppointmentServices(appointment: StylistAppointmentModel): string {
  return appointment.services.map(s => s.service_name).join(', ');
}

/**
 * A component that shows time-slot inner content.
 */
@Component({
  selector: 'time-slot-content',
  templateUrl: 'time-slot-content.component.html'
})
export class TimeSlotContentComponent {
  @Input() timeSlot: TimeSlotItem;
  @Input() isSelected = false;

  getAppointmentEndMoment = getAppointmentEndMoment;
  getAppointmentIconUrl = getAppointmentIconUrl;
  isAppointmentPendingCheckout = isAppointmentPendingCheckout;
  isBlockedTime = isBlockedTime;
  formatAppointmentClientName = formatAppointmentClientName;
  formatAppointmentServices = formatAppointmentServices;

  getAppointmentCssClasses(appointment: StylistAppointmentModel): Object {
    return {
      ...getAppointmentCssClasses(appointment),
      TimeSlotHighlighted: this.isSelected
    };
  }
}
