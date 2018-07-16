import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { HttpHeaders } from '@angular/common/http';

import { ApiResponse } from '~/core/api/base.models';
import { BaseService } from '~/core/api/base-service';

@Injectable()
export class BaseServiceMock extends BaseService {
  protected mockRequest<ResponseType>(responseMock: Observable<ResponseType>): Observable<ApiResponse<ResponseType>> {
    return this.prepareResponse(responseMock);
  }
}
