import * as faker from 'faker';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { randomPhone } from '~/shared/utils/test-utils';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseServiceMock } from '~/shared/api/base-service.mock';

import { ClientModel, GetMyClientsResponse } from '~/shared/stylist-api/clients-api.models';

export const clientsMock: ClientModel[] =
  Array(20).fill(undefined).map(() => ({
    uuid: faker.random.uuid(),
    phone: randomPhone(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    city: faker.address.city(),
    state: faker.address.state()
  }));

@Injectable()
export class ClientsApiMock extends BaseServiceMock {

  getMyClients(): Observable<ApiResponse<GetMyClientsResponse>> {
    return this.mockRequest<GetMyClientsResponse>(
      Observable.create(observer => {
        observer.next(clientsMock);
        observer.complete();
      })
    );
  }
}
