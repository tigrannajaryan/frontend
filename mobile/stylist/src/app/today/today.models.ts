export interface AppointmentStatus {
  status: string;
}

export interface Appointment {
  uuid: string;
  client_first_name: string;
  client_last_name: string;
  client_phone: string;
  regular_price: number;
  client_price: number;
  service_name: string;
  service_uuid: string;
  datetime_start_at: string;
  duration_minutes: number;
  status: string;
}

export interface Today {
  today_appointments: Appointment[];
  today_visits_count: number;
  week_visits_count: number;
  past_visits_count: number;
}
