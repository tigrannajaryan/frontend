import { Injectable } from '@angular/core';
import { StylistSummary } from './stylist-models';

import * as faker from 'faker';

export const profileSummaryMock = {
  profile: {
    id: faker.random.number(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    phone: faker.phone.phoneNumber(),
    salon_address: faker.fake('{{address.city}} {{address.streetAddress}}'),
    salon_name: faker.company.companyName()
  },
  services: [
    {name: faker.commerce.productName(), base_price: Number(faker.commerce.price()), duration_minutes: 40},
    {name: faker.commerce.productName(), base_price: Number(faker.commerce.price()), duration_minutes: 30},
    {name: faker.commerce.productName(), base_price: Number(faker.commerce.price()), duration_minutes: 90}
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

  async getStylistSummary(): Promise<StylistSummary> {
    return Promise.resolve(profileSummaryMock);
  }
}
