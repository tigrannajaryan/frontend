interface WeekdayDiscount {
  weekday_iso: number;
  discount: number;
}

interface Discounts {
  weekdays: WeekdayDiscount[];
  first_booking: number;
  rebook_within_1_week: number;
  rebook_within_2_weeks: number;
}
