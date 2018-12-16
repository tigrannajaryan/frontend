import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';

import { ISODate } from '~/shared/api/base.models';
import { DayOffer } from '~/shared/api/price.models';

interface CalendarDay extends DayOffer {
  opacity: number;
}

@Component({
  selector: 'price-calendar',
  templateUrl: 'price-calendar.component.html'
})
export class PriceCalendarComponent {
  // Expose to the view:
  moment = moment;

  @Input() showOneMonth: boolean;

  @Output() dayClick = new EventEmitter<CalendarDay>();

  protected start: ISODate;
  protected end: ISODate;
  protected calendarDays: Map<ISODate, CalendarDay>;
  protected monthsCount: number;
  protected monthsArray: string[];
  protected weekArray = Array(7).fill('');

  private _prices: DayOffer[];

  @Input()
  set prices(prices: DayOffer[]) {
    this._prices = prices;
    if (!prices || prices.length < 1) {
      this.calendarDays = undefined;
      return;
    }

    // Create offers Map {[ISODate]: DayOffer} to easily get an offer by date:
    this.calendarDays = new Map();
    for (const day of getPricesWithOpacity(prices)) {
      this.calendarDays.set(day.date, day);
    }

    // Set period boundaries to understand what months of calendar to create:
    this.start = moment(prices[0].date).startOf('month').format('YYYY-MM-DD');
    this.end = moment(prices[prices.length - 1].date).endOf('month').format('YYYY-MM-DD');

    this.monthsCount = Math.max(moment(this.end).diff(this.start, 'months'), this.showOneMonth ? 1 : 2);
    this.monthsArray = Array(this.monthsCount).fill('');
  }

  get prices(): DayOffer[] {
    return this._prices;
  }

  emptyMonthDays(startOfMonth: moment.Moment): string[] {
    return Array(moment(startOfMonth).isoWeekday()).fill('');
  }

  allMonthDays(startOfMonth: moment.Moment): string[] {
    return Array(moment(startOfMonth).daysInMonth()).fill('');
  }

  onSelectOffer(offer: CalendarDay): void {
    this.dayClick.emit(offer);
  }
}

function getPricesWithOpacity(offers: DayOffer[], threshold = 0.2): CalendarDay[] {
  if (offers.length === 0) {
    return;
  }
  if (offers.length <= 2) {
    return offers.map((offer: CalendarDay) => ({
      ...offer,
      opacity: undefined
    }));
  }
  let min = offers[0].price;
  const max = offers.slice(1).reduce((a: CalendarDay, b: CalendarDay) => {
    if (b.price < min) {
      min = b.price;
    }
    if (a.price > b.price) {
      return a;
    } else {
      return b;
    }
  }).price;
  const middle = (min + max) / 2;
  return offers.map((offer: CalendarDay) => ({
    ...offer,
    opacity: offer.price <= middle ? 1 - (offer.price - min) / (middle - min) + threshold : undefined
  }));
}
