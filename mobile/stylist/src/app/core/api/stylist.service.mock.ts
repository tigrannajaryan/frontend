import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import * as faker from 'faker';

import { ApiResponse } from '~/shared/api/base.models';
import {
  ServiceCategory,
  ServiceItem,
  SetStylistServicesParams,
  StylistProfile,
  StylistServicesListResponse
} from '~/shared/api/stylist-app.models';

export const serviceItemsMock: ServiceItem[] = [0, 0].map(() => ({
  uuid: faker.random.uuid(),
  name: faker.commerce.productName(),
  base_price: Number(faker.commerce.price())
}));

export const categoryMock: ServiceCategory = {
  uuid: faker.random.uuid(),
  name: faker.commerce.productName(),
  services: serviceItemsMock
};

export const profileSummaryMock = {
  profile: {
    uuid: faker.random.uuid(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    phone: faker.phone.phoneNumber(),
    public_phone: faker.phone.phoneNumber(),
    salon_address: faker.fake('{{address.city}} {{address.streetAddress}}'),
    salon_name: faker.company.companyName(),
    instagram_url: faker.internet.url(),
    website_url: faker.internet.url(),
    followers_count: faker.random.number()
  },
  services: [
    { name: faker.commerce.productName(), base_price: Number(faker.commerce.price()), duration_minutes: 40 },
    { name: faker.commerce.productName(), base_price: Number(faker.commerce.price()), duration_minutes: 30 },
    { name: faker.commerce.productName(), base_price: Number(faker.commerce.price()), duration_minutes: 90 }
  ],
  services_count: faker.random.number(),
  worktime: [
    {
      weekday_iso: 1,
      is_available: true,
      work_end_at: '17:00:00',
      work_start_at: '08:00:00',
      booked_appointments_count: faker.random.number()
    },
    {
      weekday_iso: 3,
      is_available: true,
      work_end_at: '18:00:00',
      work_start_at: '09:00:00',
      booked_appointments_count: faker.random.number()
    },
    {
      weekday_iso: 5,
      is_available: true,
      work_end_at: '19:00:00',
      work_start_at: '10:00:00',
      booked_appointments_count: faker.random.number()
    },
    {
      weekday_iso: 6,
      is_available: false,
      work_end_at: '20:00:00',
      work_start_at: '11:00:00',
      booked_appointments_count: faker.random.number()
    }
  ],
  total_week_appointments_count: faker.random.number()
};

@Injectable()
export class StylistServiceMock {

  getProfile(): Observable<ApiResponse<StylistProfile>> {
    return Observable.of({ response: profileSummaryMock.profile });
  }

  getStylistServices(): Observable<ApiResponse<StylistServicesListResponse>> {
    return Observable.of({
      response: {
        categories: [{
          uuid: faker.random.uuid(),
          name: faker.commerce.productName(),
          services: serviceItemsMock
        }]
      }
    });
  }

  setStylistServices(data: SetStylistServicesParams): Observable<ApiResponse<StylistServicesListResponse>> {
    return Observable.of({
      response: {
        categories: [{
          uuid: faker.random.uuid(),
          name: faker.commerce.productName(),
          services: serviceItemsMock
        }],
        service_time_gap_minutes: 60
      }
    });
  }

  /**
   * Converts groupped services from this.categores into a flat
   * array of ServiceItem.
   */
  getFlatServiceList(categories: ServiceCategory[]): ServiceItem[] | undefined {
    return categories.reduce((services, category) => (
      services.concat(
        category.services.map(service => ({
          ...service,
          is_enabled: true,
          category_uuid: category.uuid
        }))
      )
    ), []);
  }
}
