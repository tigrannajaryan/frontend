export interface AppointmentStatus {
  status: string;
}

export interface AppointmentService {
  uuid: string;
  service_name: string;
  service_uuid: string;
  client_price: number;
  regular_price: number;
  is_original: boolean;
}

export interface Appointment {
  uuid: string;
  client_first_name: string;
  client_last_name: string;
  client_phone: string;
  total_client_price_before_tax: number;
  total_tax: number;
  total_card_fee: number;
  datetime_start_at: string;
  duration_minutes: number;
  status: string;
  services: AppointmentService[];
}

export interface Today {
  today_appointments: Appointment[];
  today_visits_count: number;
  week_visits_count: number;
  past_visits_count: number;
}
