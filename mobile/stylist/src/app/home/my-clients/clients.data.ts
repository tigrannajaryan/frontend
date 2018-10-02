import * as moment from 'moment';

import { Injectable } from '@angular/core';

import { DataStore } from '~/shared/storage/data-store';
import { ClientsApiMock } from '~/shared/stylist-api/clients-api.mock';
import { GetMyClientsResponse } from '~/shared/stylist-api/clients-api.models';

@Injectable()
export class ClientsDataStore extends DataStore<GetMyClientsResponse> {
  constructor(api: ClientsApiMock) {
    // Amazon requires to update images URLs after one hour:
    const ttl1hour = moment.duration(1, 'hour').asMilliseconds();

    super('clients', () => api.getMyClients(), { cacheTtlMilliseconds: ttl1hour });
  }
}
