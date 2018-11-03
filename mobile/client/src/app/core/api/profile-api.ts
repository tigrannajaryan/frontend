import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { ApiResponse } from '~/shared/api/base.models';
import { BaseService } from '~/shared/api/base.service';
import { ProfileModel } from '~/core/api/profile.models';

@Injectable()
export class ProfileApi extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getProfile(): Observable<ApiResponse<ProfileModel>> {
    return this.get<ProfileModel>('client/profile');
  }

  updateProfile(profile: ProfileModel): Observable<ApiResponse<ProfileModel>> {
    return this.post<ProfileModel>('client/profile', profile);
  }
}
