import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { StylistProfileStatus } from '~/shared/api/stylist-app.models';
import { DataStore } from '~/shared/storage/data-store';

import { DataCacheKey } from '~/core/data.module';

@Injectable()
export class ProfileStatusDataStore extends DataStore<StylistProfileStatus> {

  // The default profile status updates
  // - on user logged in as a result of auth code confirm request,
  // - on discounts updated when discounts page just visited,
  // - on hours updated when hours page just visited,
  // - on services updated when services page visited and services set up properly.
  private profileStatus: StylistProfileStatus = {
    // NOTE: everything set to true to not affect old users that already logged in and have completed profile for sure.
    has_personal_data: true,
    has_picture_set: true,
    has_services_set: true,
    has_business_hours_set: true,
    has_weekday_discounts_set: true,
    has_other_discounts_set: true,
    has_invited_clients: true
  };

  constructor() {
    super(
      DataCacheKey.profileStatus,
      // Initially get the default profile status.
      () => Observable.of({ response: this.profileStatus }),
      // Then cache forever: get from cache and set to cache.
      { cacheTtlMilliseconds: undefined }
    );
  }
}
