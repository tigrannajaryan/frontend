import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';
import { FollowersResponse } from '~/core/api/followers.models';

@Injectable()
export class FollowersApi extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getFollowers(stylistUuid: string): Observable<ApiResponse<FollowersResponse>> {
    return this.get<FollowersResponse>(`client/stylists/${stylistUuid}/followers`);
  }
}
