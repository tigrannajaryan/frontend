import { Injectable } from '@angular/core';

import { ApiDataStore } from '~/core/utils/api-data-store';

import { ProfileModel } from '~/core/api/profile.models';
import { ProfileService } from '~/core/api/profile-service';

@Injectable()
export class ProfileDataStore extends ApiDataStore<ProfileModel> {

  constructor(profileApi: ProfileService) {
    super('profile', () => profileApi.getProfile());
  }
}
