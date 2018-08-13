import { Injectable } from '@angular/core';

import { DataStore } from '~/core/utils/data-store';

import { ProfileModel } from '~/core/api/profile.models';
import { ProfileService } from '~/core/api/profile-service';

@Injectable()
export class ProfileDataStore extends DataStore<ProfileModel> {

  constructor(profileApi: ProfileService) {
    super('profile', () => profileApi.getProfile());
  }
}
