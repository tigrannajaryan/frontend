import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';

import {
  GetStylistServicesParams,
  GetStylistServicesResponse
} from '~/core/api/services.models';

@Injectable()
export class ServicesService extends BaseService {

  getStylistServices(params: GetStylistServicesParams): Observable<ApiResponse<GetStylistServicesResponse>> {
    const path = `client/stylists/${params.stylist_uuid}/services`;
    return this.get<GetStylistServicesResponse>(path).delay(2000);
  }
}
