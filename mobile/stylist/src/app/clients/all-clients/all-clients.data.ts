import { Injectable } from '@angular/core';

import { DataStore } from '~/shared/storage/data-store';
import { ClientsApi } from '~/shared/stylist-api/clients-api';
import { GetNearbyClientsResponse } from '~/shared/stylist-api/clients-api.models';
import { DataCacheKey } from '~/core/data.module';

@Injectable()
export class AllClientsDataStore extends DataStore<GetNearbyClientsResponse> {
  constructor(api: ClientsApi) {
    // Use 0 cache TTL for any data that can be changed from outside:
    super(DataCacheKey.allClients, () => api.getNearbyClients(), { cacheTtlMilliseconds: 0 });
  }
}
