import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseService } from '~/shared/api/base-service';

import { GetMyClientsResponse, GetNearbyClientsResponse } from '~/shared/stylist-api/clients-api.models';

@Injectable()
export class ClientsApi extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getMyClients(): Observable<ApiResponse<GetMyClientsResponse>> {
    return this.get<GetMyClientsResponse>('stylist/clients');
  }

  getNearbyClients(): Observable<ApiResponse<GetNearbyClientsResponse>> {
    return this.get<GetNearbyClientsResponse>('stylist/nearby-clients');
  }
}
