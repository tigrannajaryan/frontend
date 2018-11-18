import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';

import { getHoursSinceMidnight } from '~/shared/utils/datetime-utils';

import { Appointment, AppointmentStatuses } from '~/core/api/home.models';

// Possible states of a time-slot
export interface TimeSlotState {
  // If haven’t yet seen the appointment it is shown with bold font face.
  NotSeen: boolean;
  // If not yet checked out in the last 24h (?) is shown instead of a photo.
  Checkouted: boolean;
  // If marked as no-show (!) is shown instead of a photo.
  NoShow: boolean;
  // If past appointment set opacity 60%.
  Past: boolean;
  // If canceled by the client all texts of the appointment is having strikethrough style.
  Canceled: boolean;
}

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
  slotIntervalInMin: number;
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

@Component({
  selector: 'time-slot',
  templateUrl: 'time-slot.component.html'
})
export class TimeSlotComponent {
  // Expose to the view:
  isBlockedTime = isBlockedTime;

  @Input() isSelected = false;

  @Input() set timeSlot(timeSlot: TimeSlot & FreeTimeSlot) {
    const { appointment, column = 1, idx = 0, slotIntervalInMin, startTime } = timeSlot;

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
      // TODO: add no-show icon to assets and return it
      return 'assets/icons/stylist-avatar.png';
    } else if (this.isAppointmentPendingCheckout(appointment)) {
      // TODO: add pending status question mark icon to assets and return it
      return 'assets/icons/stylist-avatar.png';
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
   */
  appointmentEndMoment(appointment: Appointment): moment.Moment {
    const start = moment(appointment.datetime_start_at);
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
      TimeSlotCancelled: appointment.status === AppointmentStatuses.cancelled_by_client,
      TimeSlotPast: this.appointmentEndMoment(appointment).isBefore(now)
    };
  }
}
