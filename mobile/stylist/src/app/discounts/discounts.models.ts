export interface WeekdayDiscount {
  weekday: number;
  weekday_verbose: string;
  discount_percent: number;
  is_working_day: boolean;
}

export interface Discounts {
  weekdays: WeekdayDiscount[];
  first_booking: number;
  rebook_within_1_week: number;
  rebook_within_2_weeks: number;
}
