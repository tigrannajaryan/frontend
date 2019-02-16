import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { Discounts, MaximumDiscounts } from './discounts.models';
import { GetMyClientsResponse } from '~/core/api/clients-api.models';
import * as faker from 'faker';
import { BaseServiceMock } from '~/shared/api/base.service.mock';

export const discounts: Discounts = {
  first_booking: faker.random.number({min: 0, max: 100}),
  rebook_within_1_week: faker.random.number({min: 0, max: 100}),
  rebook_within_2_weeks: faker.random.number({min: 0, max: 100}),
  rebook_within_3_weeks: faker.random.number({min: 0, max: 100}),
  rebook_within_4_weeks: faker.random.number({min: 0, max: 100}),
  rebook_within_5_weeks: faker.random.number({min: 0, max: 100}),
  rebook_within_6_weeks: faker.random.number({min: 0, max: 100}),
  weekdays: Array(20).fill(undefined).map(() => ({
    weekday: faker.random.number({min: 1, max: 2}),
    weekday_verbose: faker.random.word(),
    discount_percent: faker.random.number({min: 0, max: 100}),
    is_working_day: true,
    is_deal_of_week: faker.random.boolean()
  })),
  deal_of_week_weekday: faker.random.number({min: 1, max: 2})
};

export const maximumDiscounts: MaximumDiscounts = {
  is_maximum_discount_enabled: true,
  maximum_discount: faker.random.number({min: 0, max: 200})
};

@Injectable()
export class DiscountsApiMock extends BaseServiceMock {
  getDiscounts(): Observable<ApiResponse<GetMyClientsResponse>> {
    return this.mockRequest<GetMyClientsResponse>(
      Observable.create(observer => {
        observer.next(discounts);
        observer.complete();
      })
    );
  }

  getMaximumDiscounts(): Observable<ApiResponse<GetMyClientsResponse>> {
    return this.mockRequest<GetMyClientsResponse>(
      Observable.create(observer => {
        observer.next(maximumDiscounts);
        observer.complete();
      })
    );
  }
}
