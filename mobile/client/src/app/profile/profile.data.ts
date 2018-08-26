import { Injectable } from '@angular/core';

import { DataStore } from '~/core/utils/data-store';

import { ProfileModel } from '~/core/api/profile.models';
import { ProfileApi } from '~/core/api/profile-api';

@Injectable()
export class ProfileDataStore extends DataStore<ProfileModel> {

  constructor(profileApi: ProfileApi) {
    super('profile', () => profileApi.getProfile());
  }
}
