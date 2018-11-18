import { AfterViewInit, Component, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { Scroll } from 'ionic-angular';
import * as moment from 'moment';

import { ISOTimeOnly, isoTimeOnlyFormat } from '~/shared/api/base.models';
import { getHoursSinceMidnight } from '~/shared/utils/datetime-utils';
import { setIntervalOutsideNgZone } from '~/shared/utils/timer-utils';

import { Appointment, AppointmentStatuses } from '~/core/api/home.models';

import { FreeTimeSlot, hourToYInVw, TimeSlot } from '~/home-slots/time-slot/time-slot.component';

export interface TimeSlotLabel {
  text: string;
  posYInVw: number;
  areaId: string;
  labelId: string;
}

/**
 * Comparison function to sort appointments by start time
 */
function compareAppointments(a: Appointment, b: Appointment): number {
  const ma = moment(a.datetime_start_at);
  const mb = moment(b.datetime_start_at);
  return ma.diff(mb);
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

  // List of appointments to show
  @Input() set appointments(value: Appointment[]) {
    this._appointments = value;
    this.updateAppointments();
  }

  // Interval between slots in minutes
  @Input() set slotIntervalInMin(value: number) {
    this._slotIntervalInMin = value;
    this.updateAppointments();
  }

  // Start of the working day. We initially scroll vertically to this value. Must be integer.
  @Input() set startHour(value: ISOTimeOnly) {
    this._startHour = getHoursSinceMidnight(moment(value, isoTimeOnlyFormat));
    this.updateWorkingHours();
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

  // Event fired when a free slot is clicked
  @Output() freeSlotClick = new EventEmitter<FreeSlot>();

  // Event fired when a slot with appointment is clicked
  @Output() appointmentClick = new EventEmitter<Appointment>();

  @ViewChild(Scroll) scroll: Scroll;

  // Rendering data for time axis
  protected timeAxis = {
    heightInVw: 0,
    currentTimePosY: 0,
    morningNonWorkingInVw: 0,
    eveningNonWorkingInVw: 0
  };

  // List of labels to show in time axis
  timeLabels: TimeSlotLabel[] = [];

  // The slot items to display
  slotItems: Array<TimeSlot | FreeTimeSlot> = [];

  protected selectedFreeSlot: TimeSlot;

  private _appointments: Appointment[] = [];
  private _showCurTimeIndicator: boolean;
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
   * Click handler for slots
   */
  protected onSlotItemClick(slotItem: TimeSlot & FreeTimeSlot): void {
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

    // Free slots count should be 0 if interval (time gap) is 0 or undefined
    const freeSlotsCount = totalHoursInDay * 60 / this._slotIntervalInMin || 0;

    // Create free slots for entire day initially
    const freeSlots = new Array(freeSlotsCount).fill(true);

    // Make sure _appointments are ordered by start time
    this._appointments = this._appointments.sort((a, b) => compareAppointments(a, b));

    // Convert every appointment to a slot.
    //
    // Reduce is used to return all previous slots in a row. When new slot
    // is created compare to the previous slots in a row and decide whether
    // to place it in the same row or to the next one.
    //
    this._appointments.reduce((sameRowSlots: TimeSlot[], appointment: Appointment) => {
      // NOTE: ignores appointment timezone
      const startTime = moment.parseZone(appointment.datetime_start_at);

      const timeSlot: TimeSlot = { appointment, startTime };
      this.slotItems.push(timeSlot);

      // Mark all free slots which are covered by this appointment as non-free
      const durationHours = appointment.duration_minutes / 60;

      // Find the first slot that is covered. Use trunc() to properly account for partially covered slots.
      const startHourOfDay = getHoursSinceMidnight(startTime);
      const startSlotIndex = Math.trunc(this.hourToSlotIndex(startHourOfDay));

      // Find the last slot that is covered. Use ceil() to properly account for partially covered slots.
      const endSlotIndex = Math.ceil(this.hourToSlotIndex(startHourOfDay + durationHours));

      // Mark them all as non-free
      for (let slotIndex = startSlotIndex; slotIndex < endSlotIndex; slotIndex++) {
        freeSlots[slotIndex] = false;
      }

      // Is it in the same row with previous slot(s)?
      const isInSameRow = sameRowSlots.some((slot: TimeSlot) => {
        return startTime.diff(slot.startTime, 'minutes') < this._slotIntervalInMin;
      });

      if (isInSameRow) {
        // If yes, set the right column value and return new slots in the same row
        const newSameRowSlots = [timeSlot, ...sameRowSlots];

        newSameRowSlots.forEach((slot: TimeSlot, idx: number) => {
          slot.idx = idx;
          slot.column = newSameRowSlots.length;
        });
        return newSameRowSlots;
      }

      // Only one in a row
      return [timeSlot];
    }, []);

    // Now create free slot items for everything that actually remains free from appointments
    for (let slotIndex = 0; slotIndex <= freeSlots.length; slotIndex++) {
      if (freeSlots[slotIndex]) {
        const startHourOfDay = this.slotIndexToHour(slotIndex);
        const startTime = moment().startOf('day').add(startHourOfDay, 'hours');

        const freeTimeSlot: FreeTimeSlot = { startTime, slotIntervalInMin: this._slotIntervalInMin };

        this.slotItems.push(freeTimeSlot);
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
