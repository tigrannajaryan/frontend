export enum AppointmentStatus {
  new = 'new',
  cancelled_by_client = 'cancelled_by_client',
  cancelled_by_stylist = 'cancelled_by_stylist',
  no_show = 'no_show',
  checked_out = 'checked_out'
}

export interface AppointmentServiceModel {
  uuid: string;
  service_name: string;
  client_price: number;
  regular_price: number;
  is_original: boolean;
}

export interface AppointmentModel {
  uuid: string;
  stylist_first_name: string;
  stylist_last_name: string;
  total_price_before_tax: number;
  total_card_fee: number;
  total_tax: number;
  datetime_start_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  services: AppointmentServiceModel[];
}

export interface AppointmentsResponse {
  appointments: AppointmentModel[];
}
