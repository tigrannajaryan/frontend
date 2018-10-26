import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { DataStore } from '~/shared/storage/data-store';
import { ApiResponse } from '~/shared/api/base.models';

import { ProfileModel } from '~/core/api/profile.models';
import { ProfileApi } from '~/core/api/profile-api';

@Injectable()
export class ProfileDataStore extends DataStore<ProfileModel> {
  private static guardInitilization = false;

  constructor(private profileApi: ProfileApi) {
    super('profile', () => this.profileApi.getProfile(),
      { cacheTtlMilliseconds: moment.duration(1, 'hour').asMilliseconds() }); // Amazon requires to update an image URL after one hour.

    if (ProfileDataStore.guardInitilization) {
      console.error('ProfileDataStore initialized twice. Only include it in providers array of DataModule.');
    }
    ProfileDataStore.guardInitilization = true;
  }

  async update(profile: ProfileModel): Promise<ApiResponse<ProfileModel>>  {
    const apiRes = await this.profileApi.updateProfile(profile).first().toPromise();
    const profileResponse: ProfileModel = apiRes.response;
    if (profileResponse) {
      this.set(profileResponse);
    }
    return apiRes;
  }
}
