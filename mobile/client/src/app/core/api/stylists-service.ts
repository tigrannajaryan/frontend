import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';
import { StylistsListResponse } from '~/core/api/stylists.models';

@Injectable()
export class StylistsService extends BaseService {

  search(query = ''): Observable<ApiResponse<StylistsListResponse>> {
    return this.post<StylistsListResponse>('client/search-stylists', { search_like: query });
  }

  getPreferredStylists(): Observable<ApiResponse<StylistsListResponse>> {
    return this.get<StylistsListResponse>('client/preferred-stylists');
  }

  setPreferredStylist(stylistUuid: string): Observable<ApiResponse<StylistsListResponse>> {
    return this.post<StylistsListResponse>('client/preferred-stylists', { stylist_uuid: stylistUuid });
  }
}
