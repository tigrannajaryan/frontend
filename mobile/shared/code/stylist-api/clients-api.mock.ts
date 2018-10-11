import * as faker from 'faker';
import * as moment from 'moment';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { randomPhone } from '~/shared/utils/test-utils';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseServiceMock } from '~/shared/api/base-service.mock';
import { DiscountType } from '~/shared/api/price.models';

import {
  ClientModel,
  GetMyClientsResponse,
  GetNearbyClientsResponse,
  GetPricingResponse,
  MyClientModel
} from '~/shared/stylist-api/clients-api.models';

export const myClientsMock: MyClientModel[] =
  Array(20).fill(undefined).map(() => ({
    uuid: faker.random.uuid(),
    phone: randomPhone(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    city: faker.address.city(),
    state: faker.address.state()
  }));

export const allClientsMock: ClientModel[] =
  Array(20).fill(undefined).map(() => ({
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName()
  }));

@Injectable()
export class ClientsApiMock extends BaseServiceMock {

  getMyClients(): Observable<ApiResponse<GetMyClientsResponse>> {
    return this.mockRequest<GetMyClientsResponse>(
      Observable.create(observer => {
        observer.next({ clients: myClientsMock });
        observer.complete();
      })
    );
  }

  getNearbyClients(): Observable<ApiResponse<GetNearbyClientsResponse>> {
    return this.mockRequest<GetNearbyClientsResponse>(
      Observable.create(observer => {
        observer.next({ clients: allClientsMock });
        observer.complete();
      })
    );
  }

  getPricing(clientUuid?: string): Observable<ApiResponse<GetPricingResponse>> {
    return this.mockRequest<GetPricingResponse>(
      Observable.create(observer => {
        observer.next({
          client_uuid: clientUuid,
          prices: [{
            date: moment().format('YYYY-MM-DD'),
            // tslint:disable-next-line:no-null-keyword
            discount_type: null,
            is_fully_booked: false,
            is_working_day: false,
            price: 250 // base price
          }, {
            date: moment().add(1, 'd').format('YYYY-MM-DD'),
            discount_type: DiscountType.FirstBooking,
            is_fully_booked: false,
            is_working_day: true,
            price: 125
          }, {
            date: moment().add(2, 'd').format('YYYY-MM-DD'),
            discount_type: DiscountType.RevisitWithin1Week,
            is_fully_booked: false,
            is_working_day: true,
            price: 167
          },
          ...Array(6).fill(undefined).map((_, i) => ({
            date: moment().add(i + 2 + 1, 'd').format('YYYY-MM-DD'),
            discount_type: DiscountType.RevisitWithin1Week,
            is_fully_booked: true,
            is_working_day: true,
            price: 167
          })), {
            date: moment().add(2 + 6 + 1, 'd').format('YYYY-MM-DD'),
            discount_type: DiscountType.RevisitWithin2Weeks,
            is_fully_booked: false,
            is_working_day: true,
            price: 187
          },
          ...Array(6).fill(undefined).map((_, i) => ({
            date: moment().add((2 + 6 + 1) + i + 1, 'd').format('YYYY-MM-DD'),
            // tslint:disable-next-line:no-null-keyword
            discount_type: null,
            is_fully_booked: false,
            is_working_day: false,
            price: 250
          })), {
            date: moment().add((2 + 6 + 1) + 6 + 1, 'd').format('YYYY-MM-DD'),
            discount_type: DiscountType.Weekday,
            is_fully_booked: false,
            is_working_day: true,
            price: 200
          }, {
            date: moment().add((2 + 6 + 1) + 6 + 2, 'd').format('YYYY-MM-DD'),
            discount_type: DiscountType.RevisitWithin4Weeks,
            is_fully_booked: false,
            is_working_day: true,
            price: 212
          }]
        });
        observer.complete();
      })
    );
  }
}
