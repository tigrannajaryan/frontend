import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base-service';

import {
  GetStylistServicesParams,
  GetStylistServicesResponse
} from '~/core/api/services.models';

@Injectable()
export class ServicesService extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getStylistServices(params: GetStylistServicesParams): Observable<ApiResponse<GetStylistServicesResponse>> {
    const path = `client/stylists/${params.stylist_uuid}/services`;
    return this.get<GetStylistServicesResponse>(path);
  }
}
