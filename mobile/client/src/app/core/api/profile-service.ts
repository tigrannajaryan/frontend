import { BaseService } from '~/core/api/base-service';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiResponse } from '~/core/api/base.models';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

@Injectable()
export class ProfileService extends BaseService {

  getProfile(): Observable<ApiResponse<ProfileModel>> {
    return this.get<ProfileModel>('client/profile');
  }

  updateProfile(profile: ProfileModel): Observable<ApiResponse<ProfileModel>> {
    return this.post<ProfileModel>('client/profile', profile);
  }
}
