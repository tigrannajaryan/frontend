import { BaseService } from '~/core/api/base-service';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiResponse } from '~/core/api/base.models';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

@Injectable()
export class ProfileService extends BaseService {

  private readonly API_PATH = 'client/profile' ;

  getProfile(): Observable<ApiResponse<ProfileModel>> {
    return super.get<ProfileModel>(this.API_PATH);
  }

  updateProfile(profile: ProfileModel): Observable<ApiResponse<ProfileModel>> {
    return super.post<ProfileModel>(this.API_PATH, profile);
  }

}
