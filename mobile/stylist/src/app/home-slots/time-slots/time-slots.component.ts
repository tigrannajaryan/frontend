import { AfterViewInit, Component, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { Scroll } from 'ionic-angular';
import * as moment from 'moment';

import { getHoursSinceMidnight } from '~/shared/utils/datetime-utils';
import { Appointment, AppointmentStatuses } from '~/core/api/home.models';
import { setIntervalOutsideNgZone } from '~/shared/utils/timer-utils';
import { ISOTimeOnly, isoTimeOnlyFormat } from '~/shared/api/base.models';

export interface TimeSlotLabel {
  text: string;
  posYInVw: number;
  areaId: string;
  labelId: string;
}

// Position of the slot for displaying purposes. We support one or two columns.
export enum TimeSlotColumn {
  both, // slot occupies entire available width
  left, // slot occupies left half of available area
  right // slot occupies right half of available area
}

// Slot item to dispaly (either free slot or appointment)
export interface TimeSlotItem {
  startTime: moment.Moment;
  column: TimeSlotColumn;

  // Coordinates as numbers. Unit is vw.
  posYInVw: number;
  heightInVw: number;
  leftInVw: number;
  widthInVw: number;

  appointment?: Appointment;
}

/**
 * Convert a coordinate in pixels to a coordinate in vw units.
 */
function pxtovw(px: number): number {
  const srcLayoutWidth = 375;
  const vw = srcLayoutWidth * 0.01;
  return px / vw;
}

/**
 * Convert hours since midnight to a vertical Y coordinate in vw units
 */
function hourToYInVw(hoursSinceMidnight: number): number {
  // 22.4% = 84px / 375px (84px is vertical spacing of hours by design
  // https://app.zeplin.io/project/5b4505174703426f52928575/screen/5be090972434c361a3b501ea)
  return hoursSinceMidnight * 22.4;
}

// Based on design https://app.zeplin.io/project/5b4505174703426f52928575/screen/5be090972434c361a3b501ea
export const fullSlotWidthInVw = pxtovw(304);

/**
 * Comparison function to sort appointments by start time
 */
function compareAppointments(a: Appointment, b: Appointment): number {
  const ma = moment(a.datetime_start_at);
  const mb = moment(b.datetime_start_at);
  return ma.diff(mb);
}

/**
 * Return true if the appointment is just a blocked time and not a real appointment.
 */
export function isBlockedTime(appointment: Appointment): boolean {
  return !appointment.client_uuid &&
    !appointment.client_first_name &&
    !appointment.client_last_name &&
    !appointment.client_phone;
}

// Define the total vertical size of the view in hours. Must be integer.
const totalHoursInDay = 24;

// Interface used by clickFreeSlot event.
export interface FreeSlot {
  startTime: moment.Moment;
}

@Component({
  selector: 'time-slots',
  templateUrl: 'time-slots.component.html'
})
export class TimeSlotsComponent implements AfterViewInit, OnDestroy {
  AppointmentStatuses = AppointmentStatuses;
  isBlockedTime = isBlockedTime;

  // List of appointments to show
  @Input() set appointments(value: Appointment[]) {
    this._appointments = value;
    this.updateAppointments();
  }

  @Input() set selectedDate(value: moment.Moment) {
    this._selectedDate = value.startOf('day');
    this.updateAppointments();
  }

  // Interval between slots in minutes
  @Input() set slotIntervalInMin(value: number) {
    this._slotIntervalInMin = value;
    this.updateAppointments();
    this.updateScrollPos();
  }

  // Start of the working day. We initially scroll vertically to this value. Must be integer.
  @Input() set startHour(value: ISOTimeOnly) {
    this._startHour = getHoursSinceMidnight(moment(value, isoTimeOnlyFormat));
    this.updateWorkingHours();
    this.updateScrollPos();
  }

  // End of the working day.
  @Input() set endHour(value: number) {
    this._endHour = getHoursSinceMidnight(moment(value, isoTimeOnlyFormat));
    this.updateWorkingHours();
  }

  // Show or not the current time indicator
  @Input() set showCurTimeIndicator(value: boolean) {
    this._showCurTimeIndicator = value;
    this.updateScrollPos();
  }

  get showCurTimeIndicator(): boolean {
    return this._showCurTimeIndicator;
  }

  // Highlight one slot
  @Input() set highlightedAppointment(value: Appointment) {
    this._highlightedAppointment = value;
    this.updateScrollPos();
  }

  // Event fired when a free slot is clicked
  @Output() freeSlotClick = new EventEmitter<FreeSlot>();

  // Event fired when a slot with appointment is clicked
  @Output() appointmentClick = new EventEmitter<Appointment>();

  @ViewChild(Scroll) scroll: Scroll;

  // Rendering data for time axis
  timeAxis = {
    heightInVw: 0,
    currentTimePosY: 0,
    morningNonWorkingInVw: 0,
    eveningNonWorkingInVw: 0
  };

  // List of labels to show in time axis
  timeLabels: TimeSlotLabel[] = [];

  // The slot items to display
  slotItems: TimeSlotItem[] = [];

  protected selectedFreeSlot: TimeSlotItem;

  private _appointments: Appointment[] = [];
  private _selectedDate: moment.Moment = moment().startOf('day');
  private _showCurTimeIndicator: boolean;
  private _highlightedAppointment: Appointment;
  private _startHour = 9;
  private _endHour = 17;
  private _slotIntervalInMin = 30;

  // Timer id for auto-refreshing the current time indicator
  private autoRefreshTimerId: any;

  constructor(private ngZone: NgZone) {
    this.generateTimeAxis();
  }

  async ngAfterViewInit(): Promise<void> {
    // Update current time indicator once a minute
    const autoRefreshInterval = moment.duration(1, 'minute').asMilliseconds();
    this.autoRefreshTimerId = await setIntervalOutsideNgZone(this.ngZone, () => this.updateCurrentTime(), autoRefreshInterval);

    this.updateScrollPos();
  }

  ngOnDestroy(): void {
    clearInterval(this.autoRefreshTimerId);
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
   * Calculate and return end time of the appointment
   */
  appointmentEndMoment(appointment: Appointment): moment.Moment {
    const start = moment(appointment.datetime_start_at);
    return start.add(appointment.duration_minutes, 'minutes');
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
   * Returns the appropriate icon url for the appointment depending on the
   * state of the appointment.
   */
  protected appointmentIconUrl(appointment: Appointment): string {
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

  /**
   * Returns an Object with keys as CSS class names in a way that is defind by ngClass
   * Angular directive: https://angular.io/api/common/NgClass
   * Used for styling appointment slots.
   */
  protected appointmentCssClasses(appointment: Appointment): Object {
    const now = moment();
    return {
      TimeSlotNew: appointment.status === AppointmentStatuses.new,
      TimeSlotCancelled: appointment.status === AppointmentStatuses.cancelled_by_client,
      TimeSlotPast: this.appointmentEndMoment(appointment).isBefore(now),
      TimeSlotHighlighted: this._highlightedAppointment && this._highlightedAppointment.uuid === appointment.uuid
    };
  }

  /**
   * Click handler for slots
   */
  protected onSlotItemClick(slotItem: TimeSlotItem): void {
    if (slotItem.appointment) {
      // It is an appointment slot
      this.appointmentClick.emit(slotItem.appointment);
    } else {
      // It is a free slot

      // Show free slotselector
      this.selectedFreeSlot = slotItem;

      // Keep it visible for a while to allow the user to see it
      const showFreeSlotSelectorForMs = moment.duration(0.2, 'second').asMilliseconds();
      setTimeout(() => {
        // Now fire the event to let others know free slot is selected
        const freeSlot: FreeSlot = { startTime: slotItem.startTime };
        this.freeSlotClick.emit(freeSlot);
      }, showFreeSlotSelectorForMs);
    }
  }

  /**
   * Generate all information that we need to render the time axis
   */
  private generateTimeAxis(): void {
    for (let h = 0; h <= totalHoursInDay; h++) {

      // Format text for each label except for 00 and 24 hours (which must be empty).
      const text = (h === 0 || h === totalHoursInDay) ? '' :
        // tslint:disable-next-line:prefer-template
        moment(`${h}:00`, 'HH:mm').format('h A') + 'M';

      // Create the time label
      this.timeLabels.push({
        text,
        posYInVw: hourToYInVw(h),
        areaId: `TimeAxisLabelArea${h}`, // Use a unique id, we will need it later
        labelId: `TimeAxisLabel${h}`     // Same here
      });
    }

    // Time axis height is equal to the vertical position of the last label
    this.timeAxis.heightInVw = this.timeLabels[this.timeLabels.length - 1].posYInVw;

    // Show non-working hours
    this.updateWorkingHours();

    // Also render current time indicator if needed
    this.updateCurrentTime();
  }

  private updateWorkingHours(): void {
    this.timeAxis.morningNonWorkingInVw = hourToYInVw(this._startHour);
    this.timeAxis.eveningNonWorkingInVw = hourToYInVw(this._endHour);

    if (isNaN(this._startHour)) {
      // Non-working day, cover all slots with morning non-working hours:
      this.timeAxis.morningNonWorkingInVw = this.timeAxis.heightInVw;
      this.timeAxis.eveningNonWorkingInVw = this.timeAxis.heightInVw;
    }
  }

  /**
   * Calculate current time indicator coordinates
   */
  private updateCurrentTime(): void {
    const curHour = getHoursSinceMidnight(moment());
    this.timeAxis.currentTimePosY = hourToYInVw(curHour);
  }

  /**
   * Convert hours since midnight to the slot index. Works with fraction numbers too.
   */
  private hourToSlotIndex(hour: number): number {
    return hour * 60 / this._slotIntervalInMin;
  }

  /**
   * Convert slot index to hours since midnight. Works with fraction numbers too.
   */
  private slotIndexToHour(slotIndex: number): number {
    return slotIndex * this._slotIntervalInMin / 60;
  }

  /**
   * Main rendering function. Reads _appointments array and create corresponding
   * slotItems array. All gaps between appointments are filled with free slots.
   */
  private updateAppointments(): void {
    this.slotItems = [];

    let freeSlotsCount = totalHoursInDay * 60 / this._slotIntervalInMin;

    // Ensure freeSlotsCount is a valid number:
    if (isNaN(freeSlotsCount)) {
      // When interval (time gap) is 0 or undefined free slots become NaN, set it to 0:
      freeSlotsCount = 0;
    } else if (freeSlotsCount % 1 !== 0) {
      // Also, interval might be float and Math.ceil should be used to convert it to int value:
      freeSlotsCount = Math.ceil(freeSlotsCount);
    }

    // Create free slots for entire day initially
    const freeSlots = new Array(freeSlotsCount).fill(true);

    // Make sure _appointments are ordered by start time
    this._appointments = this._appointments.sort((a, b) => compareAppointments(a, b));

    // Create slot items for appointments
    let prevSlotItem;
    for (const appointment of this._appointments) {
      const startTime = moment(appointment.datetime_start_at);
      const startHourOfDay = getHoursSinceMidnight(startTime);

      // Create slot item
      const slotItem: TimeSlotItem = {
        startTime,
        posYInVw: hourToYInVw(startHourOfDay),
        heightInVw: hourToYInVw(appointment.duration_minutes / 60),
        leftInVw: 0,
        widthInVw: fullSlotWidthInVw,
        appointment,
        column: TimeSlotColumn.both
      };

      if (prevSlotItem) {
        // Does this slot item overlap with previous slot item
        const prevLastsMinutes = prevSlotItem.appointment ? prevSlotItem.appointment.duration_minutes : this._slotIntervalInMin;

        if (slotItem.startTime.diff(prevSlotItem.startTime, 'minutes') < prevLastsMinutes) {
          // Yes. We need to use 2 columns.

          if (prevSlotItem.column === TimeSlotColumn.both) {
            // Previous item occupies both columns. Narrow it.
            prevSlotItem.column = TimeSlotColumn.left;
          }
          // This slot should occupy the slot that is in opposite column to previous slot
          slotItem.column = prevSlotItem.column === TimeSlotColumn.left ? TimeSlotColumn.right : TimeSlotColumn.left;
        }
      }

      this.slotItems.push(slotItem);
      prevSlotItem = slotItem;

      // Mark all free slots which are covered by this appointment as non-free
      const durationHours = appointment.duration_minutes / 60;

      // Find the first slot that is covered. Use trunc() to properly account for partially covered slots.
      const startSlotIndex = Math.trunc(this.hourToSlotIndex(startHourOfDay));

      // Find the last slot that is covered. Use ceil() to properly account for partially covered slots.
      const endSlotIndex = Math.ceil(this.hourToSlotIndex(startHourOfDay + durationHours));

      // Mark them all as non-free
      for (let slotIndex = startSlotIndex; slotIndex < endSlotIndex; slotIndex++) {
        freeSlots[slotIndex] = false;
      }
    }

    // Based on column choice set correct horizontal coordinates of slots
    for (const slotItem of this.slotItems) {
      switch (slotItem.column) {
        case TimeSlotColumn.right:
          slotItem.leftInVw = slotItem.widthInVw / 2;
          slotItem.widthInVw = slotItem.widthInVw / 2;
          break;

        case TimeSlotColumn.left:
          slotItem.widthInVw = slotItem.widthInVw / 2;
          break;
        default:
          break;
      }
    }

    // Free slot height is equal to the interval
    const freeSlotHeightInVw = hourToYInVw(this._slotIntervalInMin / 60);

    // Now create free slot items for everything that actually remains free from appointments
    for (let slotIndex = 0; slotIndex <= freeSlots.length; slotIndex++) {
      if (freeSlots[slotIndex]) {
        const startHourOfDay = this.slotIndexToHour(slotIndex);
        const startTime = moment(this._selectedDate).add(startHourOfDay, 'hours');

        this.slotItems.push({
          startTime,
          posYInVw: hourToYInVw(startHourOfDay),
          leftInVw: 0,
          heightInVw: freeSlotHeightInVw,
          widthInVw: fullSlotWidthInVw,
          appointment: undefined,
          column: TimeSlotColumn.both
        });
      }
    }
  }

  private updateScrollPos(): void {
    // Scroll to highlighted appointment if there is one
    if (this._highlightedAppointment) {
      setTimeout(() => {
        const appointmentEl: HTMLElement = document.querySelector(
          `[data-appointment-uuid="${this._highlightedAppointment.uuid}"]`
        );
        if (appointmentEl) {
          this.scroll._scrollContent.nativeElement.scrollTop = appointmentEl.offsetTop;
        }
      });
      return;
    }

    const now = moment();

    // If we are showing current time indicator then scroll to the beginning of its hours
    // otherwise scroll to the beginning of working day.
    let scrollToHour: number;

    if (this._selectedDate.isSame(now, 'day') && this._showCurTimeIndicator) {
      scrollToHour = Math.trunc(getHoursSinceMidnight(now));
    } else if (this._startHour) {
      scrollToHour = Math.trunc(this._startHour);
    } else {
      scrollToHour = 0;
    }

    // Find the label for the starting hour
    const label = this.timeLabels[scrollToHour];

    if (!label) {
      // When almost next day
      // TODO: ideally we should scroll to the position of possible label
      return;
    }

    const elem: HTMLElement = document.getElementById(label.areaId);
    const text: HTMLElement = document.getElementById(label.labelId);

    // Scrol vertically to the top of the label text
    if (elem && text) {
      this.scroll._scrollContent.nativeElement.scrollTop = elem.offsetTop - text.offsetHeight;
    } else {
      this.scroll._scrollContent.nativeElement.scrollTop = 0;
    }
  }
}
