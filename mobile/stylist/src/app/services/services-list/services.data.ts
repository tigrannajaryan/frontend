import * as moment from 'moment';
import { Injectable } from '@angular/core';

import { DataStore } from '~/shared/storage/data-store';
import { StylistServiceProvider } from '~/core/api/stylist.service';
import { StylistServicesListResponse } from '~/shared/api/stylist-app.models';
import { DataCacheKey } from '~/core/data.module';

@Injectable()
export class StylistServicesDataStore extends DataStore<StylistServicesListResponse> {
  constructor(api: StylistServiceProvider) {
    const ttl1hour = moment.duration(1, 'hour').asMilliseconds();
    super(DataCacheKey.stylistServices, () => api.getStylistServices(), { cacheTtlMilliseconds: ttl1hour });
  }
}
