import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { DataStore } from '~/shared/storage/data-store';

import { ProfileModel } from '~/core/api/profile.models';
import { ProfileApi } from '~/core/api/profile-api';

@Injectable()
export class ProfileDataStore extends DataStore<ProfileModel> {
  private static guardInitilization = false;

  constructor(profileApi: ProfileApi) {
    if (ProfileDataStore.guardInitilization) {
      console.error('ProfileDataStore initialized twice. Only include it in providers array of DataModule.');
    }
    ProfileDataStore.guardInitilization = true;

    // Amazon requires to update an image URL after one hour.
    const ttl1hour = moment.duration(1, 'hour').asMilliseconds();

    super('profile', () => profileApi.getProfile(),
      { cacheTtlMilliseconds: ttl1hour });
  }
}
