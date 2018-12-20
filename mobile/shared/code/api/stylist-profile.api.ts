import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';

import { UserContext } from '~/shared/user-context';
import {
  StylistInstagramImagesResponse,
  StylistProfileRequestParams,
  StylistProfileResponse,
  StylistUuidModel
} from '~/shared/api/stylists.models';

@Injectable()
export class StylistProfileApi extends BaseService {

  constructor(
    protected userContext: UserContext,
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getStylistProfile(request: StylistProfileRequestParams): Observable<ApiResponse<StylistProfileResponse>> {
    return this.get<StylistProfileResponse>(`common/stylist-profile/${request.stylistUuid}?role=${request.role}`);
  }

  /**
   * Retrieve Instagram photos of a stylist who has token set up.
   */
  getStylistInstagramImages(stylist: StylistUuidModel): Observable<ApiResponse<StylistInstagramImagesResponse>> {
    return this.get<StylistInstagramImagesResponse>(`common/stylist/${stylist.uuid}/instagram-photos`);
  }
}
