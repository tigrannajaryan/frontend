import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';
import {
  AddPreferredStylistResponse,
  PreferredStylistsListResponse,
  StylistsListResponse,
  StylistsSearchParams
} from '~/shared/api/stylists.models';

import { ApiClientError, HttpStatus } from '~/shared/api-errors';
import { removeParamsFormUrl } from '~/shared/utils/string-utils';

@Injectable()
export class StylistsService extends BaseService {

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  search(params: StylistsSearchParams): Observable<ApiResponse<StylistsListResponse>> {
    const { search_like, search_location, geolocation } = params;

    return this.post<StylistsListResponse>('client/search-stylists', {
      search_like, search_location,
      latitude: geolocation && geolocation.latitude,
      longitude: geolocation && geolocation.longitude
    })
      .map((response: ApiResponse<StylistsListResponse>) => {
        if (response.response && response.response.stylists) {
          for (const item of response.response.stylists) {
            // all our urls has unique Signature and Expires in each request
            // override url with url without params
            // to use it with trackBy function
            item.profile_photo_url = removeParamsFormUrl(item.profile_photo_url);
          }
        }
        return response;
      });
  }

  getPreferredStylists(): Observable<ApiResponse<PreferredStylistsListResponse>> {
    return this.get<PreferredStylistsListResponse>('client/preferred-stylists')
      .map((response: ApiResponse<PreferredStylistsListResponse>) => {
        if (response.response && response.response.stylists) {
          for (const item of response.response.stylists) {
            // all our urls has unique Signature and Expires in each request
            // override url with url without params
            // to use it with trackBy function
            item.profile_photo_url = removeParamsFormUrl(item.profile_photo_url);
          }
        }
        return response;
      });
  }

  addPreferredStylist(stylistUuid: string): Observable<ApiResponse<AddPreferredStylistResponse>> {
    return this.post<AddPreferredStylistResponse>('client/preferred-stylists', { stylist_uuid: stylistUuid });
  }

  deletePreferredStylist(preferenceUuid: string): Observable<ApiResponse<void>> {
    return this.delete(`client/preferred-stylists/${preferenceUuid}`, {
      // Do not throw error on not_found (already deleted):
      hideGenericAlertOnErrorsLike: [new ApiClientError(HttpStatus.notFound, undefined)]
    });
  }
}
