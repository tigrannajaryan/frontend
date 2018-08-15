import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';
import {
  PreferredStylistsListResponse,
  SetPreferredStylistResponse,
  StylistsListResponse
} from '~/core/api/stylists.models';

@Injectable()
export class StylistsService extends BaseService {

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
