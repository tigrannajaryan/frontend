import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';

@Injectable()
export class BaseServiceMock extends BaseService {
  protected mockRequest<ResponseType>(responseMock: Observable<ResponseType>): Observable<ApiResponse<ResponseType>> {
    return this.prepareResponse(responseMock);
  }
}
