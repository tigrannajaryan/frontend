export interface WeekdayDiscount {
  weekday: number;
  weekday_verbose: string;
  discount_percent: number;
}

export interface Discounts {
  weekdays: WeekdayDiscount[];
  first_booking: number;
  rebook_within_1_week: number;
  rebook_within_2_weeks: number;
}
