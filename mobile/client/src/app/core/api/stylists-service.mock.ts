import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as faker from 'faker';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseServiceMock } from '~/shared/api/base-service.mock';
import {
  PreferredStylistsListResponse,
  SetPreferredStylistResponse,
  StylistsListResponse,
  StylistsSearchParams
} from '~/shared/api/stylists.models';
import { randomPhone } from '~/shared/utils/test-utils';

export const stylistsMock = Array(25).fill(undefined).map(() => {
  const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];
  return {
    uuid: faker.random.uuid(),
    first_name: name,
    last_name: lastName,
    salon_name: faker.commerce.productName(),
    salon_address: faker.address.streetAddress(),
    phone: randomPhone(),
    instagram_url: faker.helpers.slugify(`${name}${lastName}`),
    followers_count: faker.random.number()
  };
});

export const preferenceMock = {
  preference_uuid: faker.random.uuid()
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

  setPreferredStylist(stylistUuid: string): Observable<ApiResponse<SetPreferredStylistResponse>> {
    return this.mockRequest<SetPreferredStylistResponse>(
      Observable.create(observer => {
        observer.next(preferenceMock);
      })
    );
  }
}
