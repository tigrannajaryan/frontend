import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as faker from 'faker';

import { ApiResponse } from '~/core/api/base.models';
import { AppointmentModel, AppointmentsHistoryResponse, AppointmentStatus, HomeResponse } from '~/core/api/appointments.models';

@Injectable()
export class AppointmentsApiMock {

  private static genFake(count: number, status: AppointmentStatus): AppointmentModel[] {
    const response: AppointmentModel[] =
      Array(count).fill(undefined).map(() => {
        const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];
        return {
          uuid: faker.random.uuid(),
          stylist_first_name: name,
          stylist_last_name: lastName,
          stylist_photo_url: undefined,
          salon_name: faker.company.companyName(),
          total_price_before_tax: Math.random() * 200,
          total_card_fee: Math.random() * 5,
          total_tax: Math.random() * 15,
          datetime_start_at: faker.date.past(),
          duration_minutes: 0,
          status,
          services: Array(Math.round(Math.random()) + 1).fill(undefined).map(() => ({
            uuid: faker.random.uuid(),
            service_name: faker.commerce.product(),
            client_price: Math.random() * 50,
            regular_price: Math.random() * 50,
            is_original: Math.random() < 0.5
          }))
        };
      });
    return response;
  }

  getHome(): Observable<ApiResponse<HomeResponse>> {
    const upcoming = AppointmentsApiMock.genFake(0, AppointmentStatus.new);
    const previous = AppointmentsApiMock.genFake(0, AppointmentStatus.checked_out);
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          response: {
            upcoming,
            previous
          }
        });
        observer.complete();
      }, 0);
    });
  }

  getHistory(): Observable<ApiResponse<AppointmentsHistoryResponse>> {
    const appointments = AppointmentsApiMock.genFake(150, AppointmentStatus.checked_out);
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ response: { appointments } });
        observer.complete();
      }, 1000);
    });
  }
}
