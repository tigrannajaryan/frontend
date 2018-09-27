import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as faker from 'faker';

import { ApiResponse } from '~/shared/api/base.models';
import { AppointmentModel, AppointmentsHistoryResponse, AppointmentStatus, HomeResponse } from '~/core/api/appointments.models';

@Injectable()
export class AppointmentsApiMock {

  private static genFake(count: number, status: AppointmentStatus): AppointmentModel[] {
    const response: AppointmentModel[] =
      Array(count).fill(undefined).map(() => {
        const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];
        return {
          uuid: faker.random.uuid(),
          stylist_uuid: faker.random.uuid(),
          stylist_first_name: name,
          stylist_last_name: lastName,
          stylist_photo_url: undefined,
          salon_name: faker.company.companyName(),
          total_client_price_before_tax: Math.random() * 200,
          total_card_fee: Math.random() * 5,
          total_tax: Math.random() * 15,
          tax_percentage: 8.875,
          card_fee_percentage: 2.75,
          datetime_start_at: faker.date.past().toString(),
          duration_minutes: 0,
          status,
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
}
