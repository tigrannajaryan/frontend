import { BaseService } from '~/core/api/base-service';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiResponse } from '~/core/api/base.models';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

@Injectable()
export class ProfileService extends BaseService {

  updateProfile(profile: ProfileModel): Observable<ApiResponse<ProfileModel>> {
    return super.post<ProfileModel>('client/profile', profile);
  }

}
