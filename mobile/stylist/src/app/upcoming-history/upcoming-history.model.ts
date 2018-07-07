import { Appointment } from '~/today/today.models';

export interface UpcomingHistory {
  totalAppointments: number;
  upcomingAppointments: UpcomingHistoryAppointments[];
}

export interface UpcomingHistoryAppointments {
  day: string; // iso 8601 YYYY-MM-DD
  appointments: Appointment[];
}

export interface UpcomingHistoryNavParams {
  isHistory: boolean;
}
