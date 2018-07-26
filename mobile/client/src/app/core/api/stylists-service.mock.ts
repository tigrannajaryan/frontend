import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as faker from 'faker';

import { ApiResponse } from '~/core/api/base.models';
import { BaseServiceMock } from '~/core/api/base-service.mock';
import { SearchStylistsResponse } from '~/core/api/stylists.models';

@Injectable()
export class StylistsServiceMock extends BaseServiceMock {

  search(): Observable<ApiResponse<SearchStylistsResponse>> {
    return this.mockRequest<SearchStylistsResponse>(
      Observable.create(observer => {
        observer.next({
          stylists: Array(5).fill(undefined).map(() => {
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
          })
        });
      })
    );
  }
}
