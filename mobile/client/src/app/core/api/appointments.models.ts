export enum AppointmentStatus {
  new = 'new',
  cancelled_by_client = 'cancelled_by_client',
  cancelled_by_stylist = 'cancelled_by_stylist',
  no_show = 'no_show',
  checked_out = 'checked_out'
}

export interface AppointmentServiceModel {
  service_uuid: string;
  service_name: string;
  client_price: number;
  regular_price: number;
  is_original: boolean;
}

export interface AppointmentModel {
  uuid: string;
  stylist_uuid: string;
  stylist_first_name: string;
  stylist_last_name: string;
  stylist_photo_url: string;
  salon_name: string;
  total_client_price_before_tax: number;
  total_card_fee: number;
  grand_total: number;
  total_tax: number;
  tax_percentage: number;
  card_fee_percentage: number;
  datetime_start_at: string;
  profile_photo_url: string;
  duration_minutes: number;
  status: AppointmentStatus;
  services: AppointmentServiceModel[];
}

export interface AppointmentsHistoryResponse {
  appointments: AppointmentModel[];
}

export interface HomeResponse {
  upcoming: AppointmentModel[];
  last_visited: AppointmentModel;
}
