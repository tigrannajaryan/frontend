import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';

import { getHoursSinceMidnight } from '~/shared/utils/datetime-utils';

import { Appointment, AppointmentStatuses } from '~/core/api/home.models';

// Position and dimensions of
export interface TimeSlotBoundaries {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Slot item to display
export interface TimeSlot {
  // Start time of a slot. Can be retrieved from the appointment.
  // However, if the slot is a free slot we need to set this up manually.
  startTime: moment.Moment;
  appointment?: Appointment;
  // Indicates how many appointments in a row.
  idx?: number;
  column?: number;
}

// Display free time-slot
export interface FreeTimeSlot {
  startTime: moment.Moment;
  // Interval between slots in minutes. Free slot height is equal to the interval.
  slotIntervalInMin?: number;
}

/**
 * Convert a coordinate in pixels to a coordinate in vw units.
 */
export function pxtovw(px: number): number {
  const srcLayoutWidth = 375;
  const vw = srcLayoutWidth * 0.01;
  return px / vw;
}

/**
 * Convert hours since midnight to a vertical Y coordinate in vw units
 */
export function hourToYInVw(hoursSinceMidnight: number): number {
  // 22.4% = 84px / 375px (84px is vertical spacing of hours by design
  // https://app.zeplin.io/project/5b4505174703426f52928575/screen/5be090972434c361a3b501ea)
  return hoursSinceMidnight * 22.4;
}

/**
 * Return true if the appointment is just a blocked time and not a real appointment.
 */
export function isBlockedTime(appointment: Appointment): boolean {
  return appointment && [
    // When appointment exists but everything listed is not set
    'client_uuid',
    'client_first_name',
    'client_last_name',
    'client_phone'
  ].every(propName => !appointment[propName]);
}

// Based on design https://app.zeplin.io/project/5b4505174703426f52928575/screen/5be090972434c361a3b501ea
export const fullSlotWidthInVw = pxtovw(304);

/**
 * This is a time-slot component. It is used to show 3 types of time-slots.
 * - Appointment slot: a real appointment scheduled by the client or stylist.
 * - Blocked slot: a special time-slot to indicate that the stylist is busy.
 * - Free slot: a time-slot which stylist can choose to add appointment.
 *
 * An appointment time-slot can have one or more states from the list below.
 * - Not seen: the appointment hasn’t seen/checked by the stylist. (TODO: add after enabling new API endpoint)
 *   It is shown with bold font face.
 * - Pending checkout: the appointment hasn’t yet ben checked out in the last 24h.
 *   It is shown with (?) icon instead of a photo.
 * - No show: the appointment has been marked as ”no show”.
 *   It is shown with (!) icon instead of a photo.
 * - Past: the appointment time is in the past (ended, finished).
 *   It is shown with lower opacity.
 * - Canceled: the appointment has been canceled by the client.
 *   All texts of the appointment is showing with strikethrough style.
 */
@Component({
  selector: 'time-slot',
  templateUrl: 'time-slot.component.html'
})
export class TimeSlotComponent {
  // Expose to the view:
  isBlockedTime = isBlockedTime;

  @Input() isSelected = false;

  @Input() set timeSlot(timeSlot: TimeSlot & FreeTimeSlot) {
    const { appointment, column = 1, idx = 0, slotIntervalInMin = 30, startTime } = timeSlot;

    this.appointment = appointment;
    this.startTime = startTime;

    const top = hourToYInVw(getHoursSinceMidnight(startTime));
    const width = fullSlotWidthInVw / column;
    const left = width * idx;

    // Height is diff for TimeSlot vs FreeTimeSlot.
    // For a TimeSlot it can be calculated from appointment.duration_minutes.
    // And for FreeTimeSlot the slotIntervalInMin should be used.
    let height;

    if (appointment) { // TimeSlot
      height = hourToYInVw(appointment.duration_minutes / 60);
    } else { // FreeTimeSlot
      height = hourToYInVw(slotIntervalInMin / 60);
    }

    this.boundaries = { top, left, width, height };

    this._timeSlot = timeSlot;
  }

  @Output() timeSlotClick = new EventEmitter<TimeSlot & FreeTimeSlot>();

  appointment?: Appointment;
  boundaries: TimeSlotBoundaries;
  startTime: moment.Moment;

  private _timeSlot: TimeSlot & FreeTimeSlot;

  onClick(): void {
    this.timeSlotClick.emit(this._timeSlot);
  }

  /**
   * Format client name and return as string. Will use first/last if it is known
   * otherwise will return phone instead of the name.
   */
  formatClientName(appointment: Appointment): string {
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
  formatServices(appointment: Appointment): string {
    return appointment.services.map(s => s.service_name).join(', ');
  }

  /**
   * Returns the appropriate icon url for the appointment depending on the
   * state of the appointment.
   */
  appointmentIconUrl(appointment: Appointment): string {
    if (appointment.status === AppointmentStatuses.no_show) {
      return 'assets/icons/appointment/no-show@3x.png';
    } else if (this.isAppointmentPendingCheckout(appointment)) {
      return 'assets/icons/appointment/pending-checkout@3x.png';
    } else if (appointment.client_profile_photo_url) {
      return appointment.client_profile_photo_url;
    } else {
      return 'assets/icons/stylist-avatar.png';
    }
  }

  isAppointmentPendingCheckout(appointment: Appointment): boolean {
    if (appointment.status === AppointmentStatuses.new) {
      const end = this.appointmentEndMoment(appointment);
      if (end.isBefore(moment())) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calculate and return end time of the appointment
   * NOTE: ignores appointment timezone
   */
  appointmentEndMoment(appointment: Appointment): moment.Moment {
    const start = moment(moment.parseZone(appointment.datetime_start_at).format('YYYY-MM-DDTHH:mm:ss'));
    return start.add(appointment.duration_minutes, 'minutes');
  }

  /**
   * Returns an Object with keys as CSS class names in a way that is defind by ngClass
   * Angular directive: https://angular.io/api/common/NgClass
   * Used for styling appointment slots.
   */
  appointmentCssClasses(appointment: Appointment): Object {
    const now = moment();
    return {
      TimeSlotNew: appointment.status === AppointmentStatuses.new,
      TimeSlotCancelled: appointment.status === AppointmentStatuses.cancelled_by_client,
      TimeSlotPast: this.appointmentEndMoment(appointment).isBefore(now)
    };
  }
}
