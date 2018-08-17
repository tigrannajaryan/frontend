import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as faker from 'faker';

import { ApiResponse } from '~/core/api/base.models';
import { BaseServiceMock } from '~/core/api/base-service.mock';
import {
  PreferredStylistsListResponse,
  SetPreferredStylistResponse,
  StylistsListResponse
} from '~/core/api/stylists.models';

const stylists = Array(5).fill(undefined).map(() => {
  const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];
  return {
    uuid: faker.random.uuid(),
    first_name: name,
    last_name: lastName,
    salon_name: faker.commerce.productName(),
    salon_address: faker.address.streetAddress(),
    phone: `+1347${(Math.random() * Math.pow(10, 7)).toFixed()}`,
    instagram_profile_name: faker.helpers.slugify(`${name}${lastName}`)
  };
});

const preferredStylists = [];

@Injectable()
export class StylistsServiceMock extends BaseServiceMock {

  search(): Observable<ApiResponse<StylistsListResponse>> {
    return this.mockRequest<StylistsListResponse>(
      Observable.create(observer => {
        observer.next({ stylists });
      })
    );
  }

  getPreferredStylists(): Observable<ApiResponse<PreferredStylistsListResponse>> {
    return this.mockRequest<PreferredStylistsListResponse>(
      Observable.create(observer => {
        observer.next({ stylists: preferredStylists });
      })
    );
  }

  setPreferredStylist(stylistUuid: string): Observable<ApiResponse<SetPreferredStylistResponse>> {
    return this.mockRequest<SetPreferredStylistResponse>(
      Observable.create(observer => {
        observer.next({});
      })
    );
  }

  deletePreferredStylist(preferenceUuid: string): Observable<ApiResponse<void>> {
    return this.mockRequest<void>(
      Observable.create(observer => {
        observer.next({});
      })
    );
  }
}
