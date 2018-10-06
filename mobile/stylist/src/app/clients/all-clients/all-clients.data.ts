import * as moment from 'moment';
import { Injectable } from '@angular/core';

import { DataStore } from '~/shared/storage/data-store';
// import { ClientsApi } from '~/shared/stylist-api/clients-api';
import { ClientsApiMock } from '~/shared/stylist-api/clients-api.mock';
import { GetAllClientsResponse } from '~/shared/stylist-api/clients-api.models';

@Injectable()
export class AllClientsDataStore extends DataStore<GetAllClientsResponse> {
  constructor(api: ClientsApiMock) {
    const ttl1hour = moment.duration(1, 'hour').asMilliseconds();
    super('allClients', () => api.getAllClients(), { cacheTtlMilliseconds: ttl1hour });
  }
}
