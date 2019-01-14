import { ClientAppointmentModel } from '~/shared/api/appointments.models';

export interface AppointmentsHistoryResponse {
  appointments: ClientAppointmentModel[];
}

export interface HomeResponse {
  upcoming: ClientAppointmentModel[];
  last_visited: ClientAppointmentModel;
}
