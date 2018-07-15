import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as faker from 'faker';

import {
  ConfirmCodeParams,
  ConfirmCodeResponse,
  GetCodeParams,
  GetCodeResponse
} from '~/core/api/auth.models';

import { processApiResponseError } from '~/core/api/errors';

import { ApiError } from '~/core/api/errors.models';

import { AuthState } from '~/core/reducers/auth.reducer';
import { ApiCommonErrorAction } from '~/core/effects/api-common-errors.effects';

import AuthErrors from '~/core/data/auth.errors.json';

export interface ApiResponse<ReponseType> {
  response: ReponseType;
  errors?: ApiError[];
}

@Injectable()
export class AuthServiceMock {

  constructor(
    private store: Store<AuthState>
  ) {
  }

  getCode(params: GetCodeParams): Observable<ApiResponse<GetCodeResponse>> {
    return this.request<ConfirmCodeResponse>(
      Observable.create(observer => {
        setTimeout(() => {
          observer.next({});
        }, 400);
      })
    );
  }

  confirmCode(params: ConfirmCodeParams): Observable<ApiResponse<ConfirmCodeResponse>> {
    return this.request<ConfirmCodeResponse>(
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
         }, 400);
      })
    );
  }

  private request<ResponseType>(responseMock: Observable<ResponseType>): Observable<ApiResponse<ResponseType>> {
    return (
      responseMock
        .map(response => ({ response }))
        .catch(error => {
          const errors = processApiResponseError(error);

          // Dispatch actions for errors handled by errors.effects.
          // A `setTimeout` is used to dispatch globally-handled errors only after errors’ array
          // returned and handled by the effect that had triggered this request.
          setTimeout(() => {
            errors.forEach((err: ApiError) => this.store.dispatch(new ApiCommonErrorAction(err)));
          });

          return Observable.of({ response: undefined, errors });
        })
    );
  }
}
