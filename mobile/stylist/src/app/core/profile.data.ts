import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { DataStore } from '~/shared/storage/data-store';

import { StylistProfile } from '~/shared/stylist-api/stylist-models';
import { StylistServiceProvider } from '~/shared/stylist-api/stylist-service';
import { ApiResponse } from '~/shared/api/base.models';
import { DataCacheKey } from '~/core/data.module';

@Injectable()
export class ProfileDataStore extends DataStore<StylistProfile> {
  private static guardInitilization = false;
  private api: StylistServiceProvider;

  constructor(api: StylistServiceProvider) {
    if (ProfileDataStore.guardInitilization) {
      console.error('ProfileDataStore initialized twice. Only include it in providers array of DataModule.');
    }
    ProfileDataStore.guardInitilization = true;

    // Amazon requires to update an image URL after one hour. We set our cache ttl to 1 hour,
    // which will result in refreshing the profile from the backend, which in turn will get a new
    // profile image URL.
    const ttl1hour = moment.duration(1, 'hour').asMilliseconds();

    super(DataCacheKey.profile, () => api.getProfile(),
      { cacheTtlMilliseconds: ttl1hour });

    this.api = api;
  }

  /**
   * Update profile data on the backend via API and also in the local cache to keep it coherent.
   * If API call fails the local cache is not updated.
   * Returns the API response from backend call.
   */
  async set(data: StylistProfile): Promise<ApiResponse<StylistProfile>> {
    const response = await this.api.setProfile(data).get();
    if (response.response) {
      // Update the cache if the API call was successful
      super.set(response.response);
    }
    return response;
  }
}
