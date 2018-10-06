import * as faker from 'faker';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { randomPhone } from '~/shared/utils/test-utils';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseServiceMock } from '~/shared/api/base-service.mock';

import { ClientModel, GetMyClientsResponse, GetNearbyClientsResponse, MyClientModel } from '~/shared/stylist-api/clients-api.models';

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
        observer.next(myClientsMock);
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
}
