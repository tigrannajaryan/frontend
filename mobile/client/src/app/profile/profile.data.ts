import { Injectable } from '@angular/core';

import { DataStore } from '~/core/utils/data-store';

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

    super('profile', () => profileApi.getProfile());
  }
}
