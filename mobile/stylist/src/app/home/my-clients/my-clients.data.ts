import * as moment from 'moment';

import { Injectable } from '@angular/core';

import { DataStore } from '~/shared/storage/data-store';
import { ClientsApiMock } from '~/shared/stylist-api/clients-api.mock';
import { GetMyClientsResponse } from '~/shared/stylist-api/clients-api.models';

@Injectable()
export class MyMyClientsDataStore extends DataStore<GetMyClientsResponse> {
  constructor(api: ClientsApiMock) {
    // Use 0 cache TTL for any data that can be changed from outside:
    super('myClients', () => api.getMyClients(), { cacheTtlMilliseconds: 0 });
  }
}
