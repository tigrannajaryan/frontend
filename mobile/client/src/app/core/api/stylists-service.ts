import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base-service';
import {
  PreferredStylistsListResponse,
  SetPreferredStylistResponse,
  StylistsListResponse
} from '~/shared/api/stylists.models';

@Injectable()
export class StylistsService extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  search(query = ''): Observable<ApiResponse<StylistsListResponse>> {
    return this.post<StylistsListResponse>('client/search-stylists', { search_like: query });
  }

  getPreferredStylists(): Observable<ApiResponse<PreferredStylistsListResponse>> {
    return this.get<PreferredStylistsListResponse>('client/preferred-stylists');
  }

  setPreferredStylist(stylistUuid: string): Observable<ApiResponse<SetPreferredStylistResponse>> {
    return this.post<SetPreferredStylistResponse>('client/preferred-stylists', { stylist_uuid: stylistUuid });
  }

  deletePreferredStylist(preferenceUuid: string): Observable<ApiResponse<void>> {
    return this.delete(`client/preferred-stylists/${preferenceUuid}`);
  }
}
