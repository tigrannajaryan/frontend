import { ISODate } from './base.models';

export enum DiscountType {
  FirstVisit = 'first-visit',
  FrequentVisit = 'frequent-visit',
  Weekday = 'weekday'
}

export interface DayOffer {
  date: ISODate;
  price: number;
  is_fully_booked: boolean;
  is_working_day: boolean;
  discount_type?: DiscountType;
}
