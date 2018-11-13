import { AfterViewInit, Component, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { Scroll } from 'ionic-angular';
import * as moment from 'moment';

import { getHoursSinceMidnight } from '~/shared/utils/datetime-utils';
import { Appointment, AppointmentStatuses } from '~/core/api/home.models';
import { setIntervalOutsideNgZone } from '~/shared/utils/timer-utils';
import { HHMMTime } from '~/shared/api/base.models';

interface TimeLabel {
  text: string;
  posYInVw: number;
  areaId: string;
  labelId: string;
}

// Position of the slot for displaying purposes. We support one or two columns.
enum SlotColumn {
  both, // slot occupies entire available width
  left, // slot occupies left half of available area
  right // slot occupies right half of available area
}

// Slot item to dispaly (either free slot or appointment)
interface SlotItem {
  startTime: moment.Moment;
  column: SlotColumn;

  // Coordinates as numbers. Unit is vw.
  posYInVw: number;
  heightInVw: number;
  leftInVw: number;
  widthInVw: number;

  appointment?: Appointment;

  // Text of free slot
  freeSlotText?: string;
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
const fullSlotWidthInPx = 304;

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

  // Interval between slots in minutes
  @Input() slotIntervalInMin = 30;

  // Start of the working day. We initially scroll vertically to this value. Must be integer.
  @Input() set startHour(value: HHMMTime) {
    this._startHour = getHoursSinceMidnight(moment(value, 'HH:mm:ss'));
    this.updateWorkingHours();
  }

  // End of the working day.
  @Input() set endHour(value: number) {
    this._endHour = getHoursSinceMidnight(moment(value, 'HH:mm:ss'));
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

  // Event fired when a free slot is clicked
  @Output() clickFreeSlot = new EventEmitter<FreeSlot>();

  // Event fired when a slot with appointment is clicked
  @Output() clickAppointment = new EventEmitter<Appointment>();

  @ViewChild(Scroll) scroll: Scroll;

  // Rendering data for time axis
  protected timeAxis = {
    heightInVw: 0,
    currentTimePosY: 0,
    morningNonWorkingInVw: 0,
    eveningNonWorkingInVw: 0
  };

  // List of labels to show in time axis
  protected timeLabels: TimeLabel[] = [];

  // The slot items to display
  protected slotItems: SlotItem[] = [];

  protected selectedFreeSlot: SlotItem;

  private _appointments: Appointment[] = [];
  private _showCurTimeIndicator: boolean;
  private _startHour = 9;
  private _endHour = 17;

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
  protected formatClientName(appointment: Appointment): string {
    let str = appointment.client_first_name.trim();
    if (appointment.client_last_name.trim()) {
      // Add last name if it is known
      if (str.length) {
        str = `${str} `;
      }
      str = `${str} ${appointment.client_last_name.trim()}`;
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
  protected formatServices(appointment: Appointment): string {
    return appointment.services.map(s => s.service_name).join(', ');
  }

  protected isAppointmentPendingCheckout(appointment: Appointment): boolean {
    if (appointment.status === AppointmentStatuses.new) {
      const start = moment(appointment.datetime_start_at);
      const end = start.add(appointment.duration_minutes, 'minutes');
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
      // TODO: add no-show icon to assets and return it
      return 'assets/icons/stylist-avatar.png';
    } else if (this.isAppointmentPendingCheckout(appointment)) {
      // TODO: add pending status icon to assets and return it
      return 'assets/icons/stylist-avatar.png';
    } else if (appointment.client_profile_photo_url) {
      return appointment.client_profile_photo_url;
    } else {
      return 'assets/icons/stylist-avatar.png';
    }
  }

  /**
   * Click handler for slots
   */
  protected onSlotItemClick(slotItem: SlotItem): void {
    if (slotItem.appointment) {
      // It is an appointment slot
      this.clickAppointment.emit(slotItem.appointment);
    } else {
      // It is a free slot

      // Show free slotselector
      this.selectedFreeSlot = slotItem;

      // Keep it visible for a while to allow the user to see it
      const showFreeSlotSelectorForMs = moment.duration(0.2, 'second').asMilliseconds();
      setTimeout(() => {
        // Now fire the event to let others know free slot is selected
        const freeSlot: FreeSlot = { startTime: slotItem.startTime };
        this.clickFreeSlot.emit(freeSlot);
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
    return hour * 60 / this.slotIntervalInMin;
  }

  /**
   * Convert slot index to hours since midnight. Works with fraction numbers too.
   */
  private slotIndexToHour(slotIndex: number): number {
    return slotIndex * this.slotIntervalInMin / 60;
  }

  /**
   * Main rendering function. Reads _appointments array and create corresponding
   * slotItems array. All gaps between appointments are filled with free slots.
   */
  private updateAppointments(): void {
    this.slotItems = [];

    // Create free slots for entire day initially
    const freeSlots = new Array(totalHoursInDay * 60 / this.slotIntervalInMin).fill(true);

    // Make sure _appointments are ordered by start time
    this._appointments = this._appointments.sort((a, b) => compareAppointments(a, b));

    // Create slot items for appointments
    let prevSlotItem;
    for (const appointment of this._appointments) {
      const startTime = moment(appointment.datetime_start_at);
      const startHourOfDay = getHoursSinceMidnight(startTime);

      // Create slot item
      const slotItem: SlotItem = {
        startTime,
        posYInVw: hourToYInVw(startHourOfDay),
        heightInVw: hourToYInVw(appointment.duration_minutes / 60),
        leftInVw: 0,
        widthInVw: pxtovw(fullSlotWidthInPx),
        appointment,
        column: SlotColumn.both
      };

      if (prevSlotItem) {
        // Does this slot item overlap with previous slot item
        if (prevSlotItem.posYInVw + prevSlotItem.heightInVw > slotItem.posYInVw) {
          // Yes. We need to use 2 columns.

          if (prevSlotItem.column === SlotColumn.both) {
            // Previous item occupies both columns. Narrow it.
            prevSlotItem.column = SlotColumn.left;
          }
          // This slot should occupy the slot that is in opposite column to previous slot
          slotItem.column = prevSlotItem.column === SlotColumn.left ? SlotColumn.right : SlotColumn.left;
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
        case SlotColumn.right:
          slotItem.leftInVw = slotItem.widthInVw / 2;
          slotItem.widthInVw = slotItem.widthInVw / 2;
          break;

        case SlotColumn.left:
          slotItem.widthInVw = slotItem.widthInVw / 2;
          break;
        default:
          break;
      }
    }

    // Free slot height is equal to the interval
    const freeSlotHeightInVw = hourToYInVw(this.slotIntervalInMin / 60);

    // Now create free slot items for everything that actually remains free from appointments
    for (let slotIndex = 0; slotIndex <= freeSlots.length; slotIndex++) {
      if (freeSlots[slotIndex]) {
        const startHourOfDay = this.slotIndexToHour(slotIndex);
        const startTime = moment().startOf('day').add(startHourOfDay, 'hours');

        this.slotItems.push({
          startTime,
          posYInVw: hourToYInVw(startHourOfDay),
          leftInVw: 0,
          heightInVw: freeSlotHeightInVw,
          widthInVw: pxtovw(fullSlotWidthInPx),
          appointment: undefined,
          freeSlotText: `${startTime.format('h:mm A')}M`,
          column: SlotColumn.both
        });
      }
    }
  }

  private updateScrollPos(): void {
    const curHour = Math.trunc(getHoursSinceMidnight(moment()));

    // If we are showing current time indicator then scroll to the beginning of its hours
    // otherwise scroll to the beginning of working day.
    const scrollToHour = this._showCurTimeIndicator ? curHour : Math.trunc(this._startHour);

    // Find the label for the starting hour
    const label = this.timeLabels[scrollToHour];
    const elem: HTMLElement = document.getElementById(label.areaId);
    const text: HTMLElement = document.getElementById(label.labelId);

    // Scrol vertically to the top of the label text
    if (elem && text) {
      this.scroll._scrollContent.nativeElement.scrollTop = elem.offsetTop - text.offsetHeight;
    }
  }
}
