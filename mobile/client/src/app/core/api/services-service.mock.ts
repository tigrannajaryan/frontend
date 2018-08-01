import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as faker from 'faker';

import { ApiResponse } from '~/core/api/base.models';
import { BaseServiceMock } from '~/core/api/base-service.mock';

import {
  GetStylistServicesParams,
  GetStylistServicesResponse
} from '~/core/api/services.models';

@Injectable()
export class ServicesServiceMock extends BaseServiceMock {

  getStylistServices(params: GetStylistServicesParams): Observable<ApiResponse<GetStylistServicesResponse>> {
    return this.mockRequest<GetStylistServicesResponse>(
      Observable.create(observer => {
        observer.next({
          stylist_uuid: params.stylist_uuid,
          categories: Array(7).fill(undefined).map(() => ({
            uuid: faker.random.uuid(),
            name: faker.commerce.department(),
            services: Array(5).fill(undefined).map(() => ({
              uuid: faker.random.uuid(),
              name: faker.commerce.productName(),
              regular_price: faker.commerce.price()
            }))
          }))
        });
      })
    );
  }
}
