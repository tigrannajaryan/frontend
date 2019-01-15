import { ISODate, ISODateTime, ISOTimeOnly } from '~/shared/api/base.models';
import { AppointmentStatus, StylistAppointmentModel } from '~/shared/api/appointments.models';
import { CheckOutService } from '~/shared/api/stylist-app.models';
import { Weekdays } from '~/shared/api/worktime.models';

export interface DatesWithAppointmentsParams {
  date_from?: Date; // (yyyy-mm-dd) inclusive. If not specified will output appointments since the beginning of era
  date_to?: Date; // (yyyy-mm-dd) inclusive. If not specified will output appointments till the end of era
}

export interface AppointmentParams extends DatesWithAppointmentsParams {
  include_cancelled?: boolean; // False by default, if true, will also return cancelled appointments
  limit?: number; // limit the query, default is 100
}

export interface AppointmentServiceUuid {
  service_uuid: string;
}

export interface NewAppointmentRequest {
  client_first_name: string;
  client_last_name: string;
  services: AppointmentServiceUuid[];
  datetime_start_at: ISODateTime;
}

export interface DateWithAppointment {
  date: ISODate;
  has_appointments: boolean;
}

export interface DatesWithAppointmentsResponse {
  dates: DateWithAppointment[];
}

export interface AppointmentDateOffer {
  date: string; // ISO 8601 date
  price: number;
  is_fully_booked?: boolean;
  is_working_day?: boolean;
}

export interface HomeData {
  appointments: StylistAppointmentModel[];
  today_visits_count: number;
  upcoming_visits_count: number;
  followers: number;
  this_week_earning: number;
  today_slots: number;
}

export interface CheckoutRequest {
  status: AppointmentStatus;
  services: CheckOutService[];
  has_tax_included: boolean;
  has_card_fee_included: boolean;
}

export interface DayAppointmentsResponse {
  appointments: StylistAppointmentModel[];
  first_slot_start_time: ISOTimeOnly; // in hh:mm format in stylist timezone
  service_time_gap_minutes: number; // in minutes interval between slots
  total_slot_count: number;
  work_start_at: ISOTimeOnly; // in hh:mm working hours start
  work_end_at: ISOTimeOnly; // in hh:mm working hours end
  is_day_available: boolean; // is a working day
  week_summary: Weekdays;
}
