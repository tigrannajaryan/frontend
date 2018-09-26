import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseService } from '~/shared/api/base-service';

@Injectable()
export class BaseServiceMock extends BaseService {
  protected mockRequest<ResponseType>(responseMock: Observable<ResponseType>): Observable<ApiResponse<ResponseType>> {
    return this.prepareResponse('', '', responseMock, {});
  }
}
