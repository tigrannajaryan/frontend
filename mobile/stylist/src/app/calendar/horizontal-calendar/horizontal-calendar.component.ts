import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';

import { Weekday } from '~/shared/weekday';

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

  @Input() disabledWeekdays: Weekday[] = [];

  @Output() changeDate = new EventEmitter<moment.Moment>();

  startOfWeek: moment.Moment;
  daysInWeek = Array(7).fill('');

  private _selectedDate: moment.Moment;

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
    return (
      this.disabledWeekdays &&
      this.disabledWeekdays.some(weekday => weekday.isoWeekday === weekdayIso)
    );
  }

  onDateSelect(date: moment.Moment): void {
    this.selectedDate = date;
    this.changeDate.emit(date);
  }
}
