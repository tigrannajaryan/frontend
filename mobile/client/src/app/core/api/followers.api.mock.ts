import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as faker from 'faker';

import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';

import { FollowersModel, FollowersResponse } from '~/core/api/followers.models';

@Injectable()
export class FollowersApiMock extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getFollowers(stylistUuid: string): Observable<ApiResponse<FollowersResponse>> {
    const followersCount = 2;
    const followers: FollowersModel[] =
      Array(followersCount).fill(undefined).map((val, i) => {
        const [name, lastName] = [faker.name.firstName(), faker.name.lastName()];
        return {
          uuid: faker.random.uuid(),
          first_name: name,
          last_name: lastName,
          booking_count: i === 0 ? 0 : +(Math.random() * 100).toFixed(),
          photo_url: undefined
        };
      });

    return Observable.of({ response: { followers } });
  }
}
