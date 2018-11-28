import * as moment from 'moment';
import { Injectable } from '@angular/core';

import { DataStore } from '~/shared/storage/data-store';
import { StylistServiceProvider } from '~/core/api/stylist.service';
import { ServiceItem, StylistServicesListResponse } from '~/shared/api/stylist-app.models';
import { DataCacheKey } from '~/core/data.module';

@Injectable()
export class StylistServicesDataStore extends DataStore<StylistServicesListResponse> {
  private api: StylistServiceProvider;

  constructor(api: StylistServiceProvider) {
    const ttl1hour = moment.duration(1, 'hour').asMilliseconds();
    super(DataCacheKey.stylistServices, () => api.getStylistServices(), { cacheTtlMilliseconds: ttl1hour });
    this.api = api;
  }

  // tslint:disable-next-line:variable-name
  async setServices(services: ServiceItem[], service_time_gap_minutes: number): Promise<void> {
    const { response } = await this.api.setStylistServices({
      services,
      service_time_gap_minutes
    }).get();
    if (response) {
      await this.set(response);
    } else {
      await this.deleteCache();
    }
  }
}
