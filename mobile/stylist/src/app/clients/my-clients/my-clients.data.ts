import { Injectable } from '@angular/core';

import { DataStore } from '~/shared/storage/data-store';
import { ClientsApi } from '~/shared/stylist-api/clients-api';
import { GetMyClientsResponse } from '~/shared/stylist-api/clients-api.models';
import { DataCacheKey } from '~/core/data.module';

@Injectable()
export class MyClientsDataStore extends DataStore<GetMyClientsResponse> {
  constructor(api: ClientsApi) {
    // Use 0 cache TTL for any data that can be changed from outside:
    super(DataCacheKey.myClients, () => api.getMyClients(), { cacheTtlMilliseconds: 0 });
  }
}
