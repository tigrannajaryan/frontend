import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { DataStore } from '~/shared/storage/data-store';

import { ProfileModel } from '~/core/api/profile.models';
import { ProfileApi } from '~/core/api/profile-api';
import { getAuthLocalData, saveAuthLocalData } from '~/shared/storage/token-utils';
import { ClientProfileStatus } from '~/shared/api/auth.models';

@Injectable()
export class ProfileDataStore extends DataStore<ProfileModel> {
  private static guardInitilization = false;

  /**
   * Update local profile status according to the profile model.
   * When we save the profile we also update local profile status
   * to match it. This ensures the profile status is always up to date.
   */
  static async updateLocalProfileStatus(profile: ProfileModel): Promise<void> {
    const authLocalData = await getAuthLocalData();
    const profileStatus: ClientProfileStatus = authLocalData.profileStatus;
    profileStatus.has_name = profileStatus.has_name || (Boolean(profile.first_name) || Boolean(profile.last_name));
    profileStatus.has_email = profileStatus.has_email || Boolean(profile.email);
    profileStatus.has_picture_set = profileStatus.has_picture_set || Boolean(profile.profile_photo_url);
    profileStatus.has_zipcode = profileStatus.has_zipcode || Boolean(profile.zip_code);
    profileStatus.has_seen_educational_screens = profile.has_seen_educational_screens;
    await saveAuthLocalData(authLocalData);
  }

  constructor(
    private profileApi: ProfileApi,
    protected logger: Logger
  ) {
    super('profile', () => this.profileApi.getProfile(),
      { cacheTtlMilliseconds: moment.duration(1, 'hour').asMilliseconds() }); // Amazon requires to update an image URL after one hour.

    if (ProfileDataStore.guardInitilization) {
      logger.error('ProfileDataStore initialized twice. Only include it in providers array of DataModule.');
    }
    ProfileDataStore.guardInitilization = true;
  }

  async set(profile: ProfileModel): Promise<ApiResponse<ProfileModel>>  {
    // Save to backend
    const apiRes = await this.profileApi.updateProfile(profile).first().toPromise();
    const profileResponse: ProfileModel = apiRes.response;
    if (profileResponse) {
      // It was successful. Save locally too.

      // First in our data store cache
      await super.set(profileResponse);

      // Then update the local profile status appropriately
      await ProfileDataStore.updateLocalProfileStatus(profileResponse);
    }
    return apiRes;
  }
}
