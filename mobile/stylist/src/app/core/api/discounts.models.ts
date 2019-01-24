import { WeekdayIso } from '~/shared/weekday';

export interface WeekdayDiscount {
  weekday: number;
  weekday_verbose: string;
  discount_percent: number;
  is_working_day: boolean;
  is_deal_of_week: boolean;
}

export interface Discounts {
  first_booking?: number;
  rebook_within_1_week?: number;
  rebook_within_2_weeks?: number;
  rebook_within_3_weeks?: number;
  rebook_within_4_weeks?: number;
  rebook_within_5_weeks?: number;
  rebook_within_6_weeks?: number;
  weekdays?: WeekdayDiscount[];
  deal_of_week_weekday?: WeekdayIso;
}

export interface MaximumDiscounts {
  maximum_discount: number;
  is_maximum_discount_enabled: boolean;
}

export interface MaximumDiscountsWithVars extends MaximumDiscounts {
  maximum_discount_label: string;
  is_maximum_discount_label: string;
}
