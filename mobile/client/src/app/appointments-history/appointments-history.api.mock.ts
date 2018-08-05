import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as faker from 'faker';

import { ApiResponse } from '~/core/api/base.models';
import { AppointmentsResponse, AppointmentStatus } from '~/core/api/appointments.models';

@Injectable()
export class AppointmentsHistoryApiMock {

  getHistory(): Observable<ApiResponse<AppointmentsResponse>> {
    const response: AppointmentsResponse = {
      appointments: Array(150).fill(undefined).map(() => {
        const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];
        return {
          uuid: faker.random.uuid(),
          stylist_first_name: name,
          stylist_last_name: lastName,
          total_price_before_tax: Math.random() * 200,
          total_card_fee: Math.random() * 5,
          total_tax: Math.random() * 15,
          datetime_start_at: faker.date.past(),
          duration_minutes: 0,
          status: AppointmentStatus.new,
          services: Array(Math.round(Math.random()) + 1).fill(undefined).map(() => ({
            uuid: faker.random.uuid(),
            service_name: faker.commerce.product(),
            client_price: Math.random() * 50,
            regular_price: Math.random() * 50,
            is_original: Math.random() < 0.5
          }))
        };
      })
    };
    return Observable.of({ response }).delay(2000).map(r => {
      console.log('-- API request done');
      return r;
    });
  }
}
