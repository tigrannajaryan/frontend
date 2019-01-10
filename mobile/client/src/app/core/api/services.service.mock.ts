import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as faker from 'faker';
import * as moment from 'moment';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseServiceMock } from '~/shared/api/base.service.mock';

import { WeekdayIso } from '~/shared/weekday';
import {
  GetPricelistParams,
  GetPricelistResponse,
  GetStylistServicesParams,
  GetStylistServicesResponse
} from '~/core/api/services.models';
import { ServicesService } from './services.service';

export const serviceItemsMock =
  Array(5).fill(undefined).map(() => ({
    uuid: faker.random.uuid(),
    name: faker.commerce.productName(),
    base_price: faker.commerce.price()
  }));

export const categoryMock = {
  uuid: faker.random.uuid(),
  name: faker.commerce.department(),
  services: serviceItemsMock
};

@Injectable()
export class ServicesServiceMock extends ServicesService {

  private mock = new BaseServiceMock(undefined, undefined, undefined);

  constructor() {
    super(undefined, undefined, undefined);
  }

  getStylistServices(params: GetStylistServicesParams): Observable<ApiResponse<GetStylistServicesResponse>> {
    return this.mock.mockRequest<GetStylistServicesResponse>(
      Observable.create(observer => {
        observer.next({
          stylist_uuid: params.stylist_uuid,
          categories: [categoryMock]
        });
        observer.complete();
      })
    );
  }

  getPricelist(params: GetPricelistParams): Observable<ApiResponse<GetPricelistResponse>> {
    return this.mock.mockRequest<GetPricelistResponse>(
      Observable.create(observer => {
        const prices = [];
        const start = moment(new Date());
        const end = moment(start.format('YYYY-MM-DD')).add(2, 'weeks');
        for (const i = moment(start); i.diff(end, 'days') <= 0; i.add(1, 'days')) {
          const weekDay = Number(i.isoWeekday());
          prices.push({
            date: i.format('YYYY-MM-DD'),
            price: Number((Math.random() * 300).toFixed()),
            is_fully_booked: false,
            is_working_day: [WeekdayIso.Tue, WeekdayIso.Fri].indexOf(weekDay) === -1
          });
        }
        observer.next({
          stylist_uuid: faker.random.uuid(),
          service_uuid: faker.random.uuid(),
          prices
        });
        observer.complete();
      })
    );
  }
}
