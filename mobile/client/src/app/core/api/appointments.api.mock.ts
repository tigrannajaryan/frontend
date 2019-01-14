import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as faker from 'faker';

import { ApiResponse } from '~/shared/api/base.models';
import {
  AppointmentChangeRequest,
  AppointmentStatus,
  ClientAppointmentModel
} from '~/shared/api/appointments.models';
import { AppointmentsHistoryResponse, HomeResponse } from '~/core/api/appointments.models';

@Injectable()
export class AppointmentsApiMock {

  private static genFake(count: number, status: AppointmentStatus): ClientAppointmentModel[] {
    const response: ClientAppointmentModel[] =
      Array(count).fill(undefined).map(() => {
        const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];
        return {
          uuid: faker.random.uuid(),
          stylist_uuid: faker.random.uuid(),
          stylist_first_name: name,
          stylist_last_name: lastName,
          stylist_photo_url: undefined,
          profile_photo_url: undefined,
          salon_name: faker.company.companyName(),
          total_client_price_before_tax: Math.random() * 200,
          total_card_fee: Math.random() * 5,
          total_tax: Math.random() * 15,
          tax_percentage: 8.875,
          grand_total: 9,
          card_fee_percentage: 2.75,
          created_at: faker.date.past().toString(),
          datetime_start_at: faker.date.past().toString(),
          duration_minutes: 0,
          status,
          has_card_fee_included: true,
          has_tax_included: true,
          services: Array(Math.round(Math.random()) + 1).fill(undefined).map(() => ({
            service_uuid: faker.random.uuid(),
            service_name: faker.commerce.product(),
            client_price: Math.random() * 50,
            regular_price: Math.random() * 50,
            is_original: Math.random() < 0.5
          }))
        };
      });
    return response;
  }

  getHome(upcomingCount = 0, lastVisitedCount = 0): Observable<ApiResponse<HomeResponse>> {
    const upcoming = AppointmentsApiMock.genFake(upcomingCount, AppointmentStatus.new);
    const lastVisited = AppointmentsApiMock.genFake(lastVisitedCount, AppointmentStatus.checked_out)[0];
    return new Observable(observer => {
      observer.next({
        response: {
          upcoming,
          last_visited: lastVisited
        }
      });
      observer.complete();
    });
  }

  getHistory(historyCount = 0): Observable<ApiResponse<AppointmentsHistoryResponse>> {
    const appointments = AppointmentsApiMock.genFake(historyCount, AppointmentStatus.checked_out);
    return new Observable(observer => {
      observer.next({ response: { appointments } });
      observer.complete();
    });
  }

  changeAppointment(appointmentUuid: string, data: AppointmentChangeRequest): Observable<ApiResponse<ClientAppointmentModel>> {
    const appointments = AppointmentsApiMock.genFake(1, AppointmentStatus.checked_out);
    return new Observable(observer => {
      observer.next({ response: appointments[0] });
      observer.complete();
    });
  }
}
