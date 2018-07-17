export enum AppointmentStatuses {
  new = 'new',
  no_show = 'no_show',
  cancelled_by_stylist = 'cancelled_by_stylist',
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
  has_tax_included: boolean;
  has_card_fee_included: boolean;
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
  datetime_start_at: string; // ISO 8601: 2018-05-20T18:00:00-04:00
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
  datetime_start_at: string;
  duration_minutes: number;
  status: AppointmentStatuses;
  services: AppointmentService[];
  client_uuid: string;
  grand_total: number;
}

export interface AppointmentDateOffer {
  date: string; // ISO 8601 date
  price: number;
  is_fully_booked?: boolean;
  is_working_day?: boolean;
}

export interface Home {
  appointments: Appointment[];
  today_visits_count: number;
  upcoming_visits_count: number;
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
