import { ISODateTime, ISOTimeOnly } from '~/shared/api/base.models';

export enum AppointmentStatuses {
  new = 'new',
  no_show = 'no_show',
  cancelled_by_stylist = 'cancelled_by_stylist',
  cancelled_by_client = 'cancelled_by_client',
  checked_out = 'checked_out'
}

export interface AppointmentParams {
  date_from?: Date; // (yyyy-mm-dd) inclusive. If not specified will output appointments since the beginning of era
  date_to?: Date; // (yyyy-mm-dd) inclusive. If not specified will output appointments till the end of era
  include_cancelled?: boolean; // False by default, if true, will also return cancelled appointments
  limit?: number; // limit the query, default is 100
}

export interface AppointmentChangeRequest {
  status: AppointmentStatuses;
  has_tax_included?: boolean;
  has_card_fee_included?: boolean;
  services?: CheckOutService[];
}

export interface AppointmentPreviewRequest {
  appointment_uuid?: string;
  datetime_start_at: string;
  services: CheckOutService[];
  has_tax_included: boolean;
  has_card_fee_included: boolean;
}

export interface AppointmentPreviewResponse {
  duration_minutes: number;
  grand_total: number;
  total_client_price_before_tax: number;
  total_tax: number;
  total_card_fee: number;
  tax_percentage: number;
  card_fee_percentage: number;
  services: AppointmentService[];
}

export interface AppointmentService {
  service_uuid: string;
  service_name: string;
  client_price: number;
  regular_price: number;
  is_original: boolean;
  isChecked?: boolean;
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

export interface Appointment {
  uuid: string;
  client_first_name: string;
  client_last_name: string;
  client_phone: string;
  total_client_price_before_tax: number;
  total_tax: number;
  total_card_fee: number;
  has_tax_included: boolean;
  has_card_fee_included: boolean;
  datetime_start_at: ISODateTime;
  duration_minutes: number;
  status: AppointmentStatuses;
  services: AppointmentService[];
  client_uuid: string;
  client_profile_photo_url: string;
  grand_total: number;
  created_at: ISODateTime;
}

export interface AppointmentDateOffer {
  date: string; // ISO 8601 date
  price: number;
  is_fully_booked?: boolean;
  is_working_day?: boolean;
}

export interface HomeData {
  appointments: Appointment[];
  today_visits_count: number;
  upcoming_visits_count: number;
  followers: number;
  this_week_earning: number;
  today_slots: number;
}

export interface CheckoutRequest {
  status: AppointmentStatuses;
  services: CheckOutService[];
  has_tax_included: boolean;
  has_card_fee_included: boolean;
}

export interface CheckOutService {
  service_uuid: string;
}

export interface DayAppointmentsResponse {
  appointments: Appointment[];
  first_slot_start_time: ISOTimeOnly; // in hh:mm format in stylist timezone
  service_time_gap_minutes: number; // in minutes interval between slots
  total_slot_count: number;
  work_start_at: ISOTimeOnly; // in hh:mm working hours start
  work_end_at: ISOTimeOnly; // in hh:mm working hours end
  is_day_available: boolean; // is a working day
}
