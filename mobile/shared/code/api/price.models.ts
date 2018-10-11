import { ISODate } from './base.models';

export enum DiscountType {
  FirstBooking = 'first_booking',
  FirstVisit = 'first-visit',
  FrequentVisit = 'frequent-visit',
  RevisitWithin1Week = 'revisit_within_1_week',
  RevisitWithin2Weeks = 'revisit_within_2_weeks',
  RevisitWithin4Weeks = 'revisit_within_4_weeks',
  Weekday = 'weekday'
}

export interface DayOffer {
  date: ISODate;
  price: number;
  is_fully_booked: boolean;
  is_working_day: boolean;
  discount_type?: DiscountType;
}

export interface ServiceModel {
  uuid: string;
  name: string;
  base_price: number;
}
