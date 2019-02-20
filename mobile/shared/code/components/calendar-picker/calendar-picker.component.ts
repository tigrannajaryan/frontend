import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Content } from 'ionic-angular/components/content/content';
import * as moment from 'moment';

import { ISODate, isoDateFormat } from '~/shared/api/base.models';
import { Weekday, WeekdayIso } from '~/shared/weekday';
import { MadeDisableOnClick } from '~/shared/utils/loading';

/**
 * Represents one abstract weekday day in CalendarPicker
 */
export interface DefaultWeekday extends Weekday {
  // Visual effects saved in booleans:
  isFaded?: boolean;        // shown with regular font and grey color
  isHighlighted?: boolean;  // shown with a circle around a date
  isSelected?: boolean;     // shown with black circle around a date
}

/**
 * Represents one particular day in CalendarPicker
 */
export interface Day extends DefaultWeekday {
  day: number;
}

export type DaysInMonth = Map<ISODate, Day>;

/**
 * Represents a month of CalendarPicker
 */
export interface Month {
  year: number;
  month: number; // 0 to 11
  days: DaysInMonth;
}

/**
 * Used to set up defaults. E.g. some of days can be marked as faded based on weekday.
 */
export type DefaultWeekdays = DefaultWeekday[] & { length: 7 };

export interface CalendarPickerParams {
  // Initial setup of days on a weekly bases. Can be used to mark some days as faded.
  defaultWeekdays: DefaultWeekdays;

  // Selected date in YYYY-MM-DD fromat.
  selectedIsoDate?: ISODate;

  // Special function that receives loaded days by ref. These days can be modified.
  // Can result in changes inside the component. This is not a pure function approach by design.
  onDaysLoaded?(days: DaysInMonth): void | Promise<void>;

  // Simply calls this callback and provides ISODate (YYYY-MM-DD) as a param.
  onDateSelected?(date: ISODate): void | Promise<void>;
}

@Component({
  selector: 'calendar-picker',
  templateUrl: 'calendar-picker.component.html'
})
export class CalendarPickerComponent implements AfterViewInit, OnInit {

  @ViewChild(Content) content: Content;

  // Expose to the view:
  moment = moment;
  Array = Array;

  private params: CalendarPickerParams;

  // For internal calculations
  private isoDateToday: ISODate = moment().format('YYYY-MM-DD');

  // We operate using months
  private months: Month[] = [];

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
  }

  /**
   * Assign params and show months.
   */
  ngOnInit(): void {
    this.params = (this.navParams.get('params') || {}) as CalendarPickerParams;

    // Create and show months:
    this.constructInitialData();
  }

  /**
   * Used for initial scrolling to selected date or today date.
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      const selected = document.querySelector('calendar-picker .is-selected') as HTMLElement;
      const today = document.querySelector('calendar-picker .is-today') as HTMLElement;

      const h1 = (selected || today).offsetTop;
      const h2 = (document.querySelector('calendar-picker .CP-monthName') as HTMLElement).offsetHeight;

      this.content._scrollContent.nativeElement.scrollTop = h1 - h2 - 16; // 16 is for some nicer offset
    });
  }

  /**
   * Returns CSS class names of a day.
   */
  getClassnames(isoDate: ISODate, day: Day): any {
    return {
      'is-faded': day.isFaded,
      'is-highlighted': day.isHighlighted,
      'is-future': isoDate > this.isoDateToday,
      'is-selected': isoDate === this.params.selectedIsoDate,
      'is-today': isoDate === this.isoDateToday
    };
  }

  /**
   * Calls specified callback when some date is selected.
   */
  @MadeDisableOnClick
  async onDateSelect(isoDate: ISODate): Promise<void> {
    if (this.params.onDateSelected) {
      await this.params.onDateSelected(isoDate);
    }
    await this.viewCtrl.dismiss();
  }

  /**
   * Constructs months on start. Emits months loaded callback when initial months are constructed.
   */
  private constructInitialData(): void {

    // From -1/2 year to 1/2 year:
    for (let i = -6; i <= 6; i++) {
      const date = moment().add(i, 'months');
      const month = this.constructMonth(date);

      this.months.push(month);
    }

    if (this.params.onDaysLoaded) {
      // Allow parent component to modify days (every day passed by ref):
      this.params.onDaysLoaded(
        this.getDaysOfMonths(this.months)
      );
    }
  }

  /**
   * Create one month’s data.
   * NOTE: uses defaultWeekdays to create days of month with defaults.
   */
  private constructMonth(date: moment.Moment): Month {
    const daysCount = date.daysInMonth();

    const month: Month = {
      year: date.get('year'),
      month: date.get('month'), // 0 to 11
      days: new Map<ISODate, Day>()
    };

    for (let day = 1; day <= daysCount; day++) {
      // Set date:
      date.date(day);

      month.days.set(
        date.format(isoDateFormat),
        {
          ...this.params.defaultWeekdays[date.isoWeekday() - 1],
          isoWeekday: date.isoWeekday() as WeekdayIso,
          day
        }
      );
    }

    return month;
  }

  /**
   * Converts months array into a sorted Map with all the days: Month[] –> Map<ISODate, Day>.
   * This is an output format of days that is supplied to onDaysLoaded callback and can be modified by ref inside it.
   */
  private getDaysOfMonths = (months: Month[]): DaysInMonth => {
    const allDaysEntries = months.reduce(
      (days: Array<[ISODate, Day]>, month: Month): Array<[ISODate, Day]> => {
        const newDays = Array.from(month.days.entries()) as Array<[ISODate, Day]>;
        return days.concat(newDays);
      },
      []
    );
    return new Map<ISODate, Day>(allDaysEntries);
  };
}
