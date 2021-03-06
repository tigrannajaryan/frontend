import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as faker from 'faker';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseServiceMock } from '~/shared/api/base.service.mock';
import {
  AddPreferredStylistResponse,
  PreferredStylistsListResponse,
  StylistModel,
  StylistsListResponse,
  StylistsSearchParams
} from '~/shared/api/stylists.models';
import { randomPhone } from '~/shared/utils/test-utils';

export const stylistsMock: StylistModel[] = Array(25).fill(undefined).map((val, index) => {
  const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];
  return {
    uuid: faker.random.uuid(),
    preference_uuid: faker.random.uuid(),
    first_name: name,
    last_name: lastName,
    salon_name: faker.commerce.productName(),
    salon_address: faker.address.streetAddress(),
    phone: randomPhone(),
    email: faker.internet.email(),
    profile_photo_url: faker.image.imageUrl(),
    instagram_url: faker.helpers.slugify(`${name}${lastName}`),
    followers_count: faker.random.number(),
    is_profile_bookable: !!(index % 2),
    rating_percentage: faker.random.number({min: 1, max: 100}),
    specialities: []
  };
});

export const preferenceMock = {
  preference_uuid: faker.random.uuid()
};

export const offerMock = {
  date: '2018-12-31',
  price: faker.random.number(),
  is_fully_booked: faker.random.boolean(),
  is_working_day: faker.random.boolean()
};

@Injectable()
export class StylistsServiceMock extends BaseServiceMock {

  search(params: StylistsSearchParams): Observable<ApiResponse<StylistsListResponse>> {
    return this.mockRequest<StylistsListResponse>(
      Observable.create(observer => {
        observer.next({
          stylists: stylistsMock
        });
      })
    );
  }

  getPreferredStylists(): Observable<ApiResponse<PreferredStylistsListResponse>> {
    return this.mockRequest<PreferredStylistsListResponse>(
      Observable.create(observer => {
        observer.next({
          stylists: stylistsMock
        });
      })
    );
  }

  addPreferredStylist(stylistUuid: string): Observable<ApiResponse<AddPreferredStylistResponse>> {
    return this.mockRequest<AddPreferredStylistResponse>(
      Observable.create(observer => {
        observer.next(preferenceMock);
      })
    );
  }
}
