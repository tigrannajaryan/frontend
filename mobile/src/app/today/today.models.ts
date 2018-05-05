export interface AppointmentStatus {
  appointmentUuid: string;
  start_time: string;
  duration_sec: number;
  client_name: string;
}

export interface Today {
  appointments: AppointmentStatus[];
}
