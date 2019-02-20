import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';

import { WEEKDAY_SHORT_NAMES } from '~/shared/weekday';
import { Workday } from '~/shared/api/worktime.models';
import { MadeDisableOnClick } from '~/shared/utils/loading';

/**
 * A horizontal calendar with one week from Sun to Sat.
 */
@Component({
  selector: 'horizontal-calendar',
  templateUrl: 'horizontal-calendar.component.html'
})
export class HorizontalCalendarComponent {
  moment = moment;

  @Input() set selectedDate(date: moment.Moment) {
    this.startOfWeek = moment(date).startOf('week');
    this._selectedDate = date;
  }

  @Input() set weekdays(weekdays: Workday[]) {
    if (weekdays) {
      for (const weekday of weekdays) {
        this.disabledWeekdays[weekday.weekday_iso] = !weekday.is_working_day;
        this.daysWithAppointments[weekday.weekday_iso] = Boolean(weekday.has_appointments);
      }
    }
  }

  @Output() changeDate = new EventEmitter<moment.Moment>();

  startOfWeek: moment.Moment;
  daysInWeek = Array(7).fill('');

  private _selectedDate: moment.Moment;

  // Store disabled and days with appointments in 8-length array.
  // NOTE: because of wekday_iso starts from 1 and ends with 7 we use 8 for length, not 7.
  private disabledWeekdays: boolean[] = WEEKDAY_SHORT_NAMES.map(() => false);
  private daysWithAppointments: boolean[] = WEEKDAY_SHORT_NAMES.map(() => false);

  constructor() {
    // Set today as a default:
    this.selectedDate = moment();
  }

  isSelected(date: moment.Moment): boolean {
    return this._selectedDate && this._selectedDate.isSame(date, 'day');
  }

  isToday(date: moment.Moment): boolean {
    return moment().isSame(date, 'day');
  }

  isDisabled(date: moment.Moment): boolean {
    const weekdayIso = date.isoWeekday();
    return this.disabledWeekdays[weekdayIso];
  }

  hasAppointments(date: moment.Moment): boolean {
    const weekdayIso = date.isoWeekday();
    return this.daysWithAppointments[weekdayIso];
  }

  @MadeDisableOnClick
  async onDateSelect(date: moment.Moment): Promise<void> {
    this.selectedDate = date;
    this.changeDate.emit(date);
  }
}
