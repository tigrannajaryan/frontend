import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';
import { SearchStylistsResponse } from '~/core/api/stylists.models';

@Injectable()
export class StylistsService extends BaseService {

  search(query = ''): Observable<ApiResponse<SearchStylistsResponse>> {
    return this.post<SearchStylistsResponse>('client/search-stylists', { search_like: query });
  }
}
