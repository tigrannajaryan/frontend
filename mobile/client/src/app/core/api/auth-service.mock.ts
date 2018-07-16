import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as faker from 'faker';

import { ApiResponse } from '~/core/api/base.models';
import { BaseServiceMock } from '~/core/api/base-service.mock';

import {
  ConfirmCodeParams,
  ConfirmCodeResponse,
  GetCodeParams,
  GetCodeResponse
} from '~/core/api/auth.models';

import AuthErrors from '~/core/data/auth.errors.json';

@Injectable()
export class AuthServiceMock extends BaseServiceMock {

  getCode(params: GetCodeParams): Observable<ApiResponse<GetCodeResponse>> {
    return this.mockRequest<ConfirmCodeResponse>(
      Observable.create(observer => {
        setTimeout(() => {
          observer.next({});
        }, 500);
      })
    );
  }

  confirmCode(params: ConfirmCodeParams): Observable<ApiResponse<ConfirmCodeResponse>> {
    return this.mockRequest<ConfirmCodeResponse>(
      Observable.create(observer => {
        setTimeout(() => {
          const error = new HttpErrorResponse({
            headers: new HttpHeaders({}),
            status: 400,
            error: AuthErrors.invalid_code
          });
          observer.error(error);
          observer.next({
            token: faker.internet.password(),
            created_at: Number(new Date())
          });
         }, 500);
      })
    );
  }
}
