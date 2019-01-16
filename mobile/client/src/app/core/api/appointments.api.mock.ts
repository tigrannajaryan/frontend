import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import * as faker from 'faker';

import { ApiResponse } from '~/shared/api/base.models';
import {
  AppointmentChangeRequest,
  AppointmentPreviewRequest,
  AppointmentPreviewResponse,
  AppointmentStatus,
  ClientAppointmentModel
} from '~/shared/api/appointments.models';
import { AppointmentsHistoryResponse, HomeResponse } from '~/core/api/appointments.models';

export const servicesMock = [
  {
    service_uuid: faker.random.uuid(),
    service_name: faker.commerce.productName(),
    client_price: 100,
    regular_price: 200,
    is_original: false
  },
  {
    service_uuid: faker.random.uuid(),
    service_name: faker.commerce.productName(),
    client_price: 300,
    regular_price: 400,
    is_original: false
  }
];

export const appointmentMock: ClientAppointmentModel = {
  uuid: faker.random.uuid(),
  created_at: moment().format(),
  datetime_start_at: moment().format(),
  duration_minutes: 0,
  status: AppointmentStatus.new,
  services: servicesMock,
  // Price
  total_client_price_before_tax: faker.random.number(),
  total_card_fee: faker.random.number(),
  grand_total: faker.random.number(),
  total_tax: faker.random.number(),
  tax_percentage: faker.random.number(),
  card_fee_percentage: faker.random.number(),
  has_tax_included: false,
  has_card_fee_included: false,
  total_discount_amount: faker.random.number(),
  total_discount_percentage: faker.random.number(),
  // Stylist
  stylist_uuid: faker.random.uuid(),
  stylist_first_name: faker.name.firstName(),
  stylist_last_name: faker.name.lastName(),
  stylist_photo_url: faker.image.imageUrl(),
  profile_photo_url: faker.image.imageUrl(),
  salon_name: faker.commerce.productName()
};

export const previewMock: AppointmentPreviewResponse = {
  datetime_start_at: moment().format(),
  duration_minutes: faker.random.number(),
  grand_total: faker.random.number(),
  total_client_price_before_tax: faker.random.number(),
  total_tax: faker.random.number(),
  total_card_fee: faker.random.number(),
  tax_percentage: faker.random.number(),
  total_discount_amount: faker.random.number(),
  total_discount_percentage: faker.random.number(),
  card_fee_percentage: faker.random.number(),
  services: servicesMock,
  has_card_fee_included: false,
  has_tax_included: false
};

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
          total_discount_amount: faker.random.number(),
          total_discount_percentage: faker.random.number(),
          tax_percentage: 8.875,
          grand_total: 9,
          card_fee_percentage: 2.75,
          created_at: faker.date.past().toString(),
          datetime_start_at: faker.date.past().toString(),
          duration_minutes: 0,
          status,
          has_card_fee_included: false,
          has_tax_included: false,
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

  getAppointmentPreview(data: AppointmentPreviewRequest): Observable<ApiResponse<AppointmentPreviewResponse>> {
    return new Observable(observer => {
      observer.next({ response: previewMock });
      observer.complete();
    });
  }
}
