import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpErrorResponse } from '@angular/common/http';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseService } from '~/shared/api/base.service';
import { ApiError, HttpStatus } from '~/shared/api-errors';

@Injectable()
export class BaseServiceMock extends BaseService {
  mockRequest<ResponseType>(responseMock: Observable<ResponseType>): Observable<ApiResponse<ResponseType>> {
    return this.prepareResponse('', '', responseMock, {});
  }

  simulateHttpError<ResponseType>(status: HttpStatus, error: ApiError): Observable<ApiResponse<ResponseType>> {
    return this.prepareResponse('', '',
      Observable.create(() => {
        throw new HttpErrorResponse({ status, error });
      }), {}
    );
  }
}
