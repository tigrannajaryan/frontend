import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Events } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { ApiResponse } from '~/shared/api/base.models';
import { BaseService } from '~/shared/api/base.service';
import { SharedEventTypes } from '~/shared/events/shared-event-types';
import { ProfileModel } from '~/core/api/profile.models';

@Injectable()
export class ProfileApi extends BaseService {

  constructor(
    private events: Events,
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getProfile(): Observable<ApiResponse<ProfileModel>> {
    return this.get<ProfileModel>('client/profile')
      .map(response => {
        // Publish event to update gmap key.
        if (response.response) {
          this.events.publish(SharedEventTypes.update_gmap_key, response.response.google_api_key);
        }
        return response;
      });
  }

  updateProfile(profile: ProfileModel): Observable<ApiResponse<ProfileModel>> {
    return this.post<ProfileModel>('client/profile', profile);
  }
}
