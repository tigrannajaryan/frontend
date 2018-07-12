import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as faker from 'faker';

import {
  ConfirmCodeParams,
  ConfirmCodeResponse,
  GetCodeParams,
  GetCodeResponse
} from '~/core/api/auth.models';

import {
  processApiResponseError,
  ServerUnreachableError
} from '~/core/api/errors';

import {
  ApiBaseError,
  ServerUnreachableError
} from '~/core/api/errors.models';

import { ApiCommonErrorAction, apiErrorsActions } from '~/core/effects/api-errors.effects';

import AuthErrors from '~/core/data/auth.errors.json';

export interface ApiResponse<ReponseType> {
  response: ReponseType;
  errors: any[];
}

@Injectable()
export class AuthServiceMock {

  constructor(
    private store: Store<any>
  ) {
  }

  getCode(params: GetCodeParams): Observable<ApiResponse<GetCodeResponse>> {
    return this.request(
      Observable.create(observer => {
        setTimeout(() => {
          observer.next({});
        }, 400);
      })
    );
  }

  confirmCode(params: ConfirmCodeParams): Observable<ApiResponse<ConfirmCodeResponse>> {
    return this.request(
      Observable.create(observer => {
        setTimeout(() => {
          const error = new HttpErrorResponse({
            headers: {},
            status: 400,
            error: AuthErrors.invalid_code
          });
          observer.error(error);
          // observer.next({
          //   token: faker.internet.password(),
          //   created_at: Number(new Date())
          // });
         }, 400);
      })
    );
  }

  private request(responseMock: Observable<any>): Observable<any> {
    return (
      responseMock
        .map(response => ({ response }))
        .catch(error => {
          const errors = processApiResponseError(error);

          // Dispatch actions for errors handled by errors.effects.
          // Skip for fields and non-fields errors.
          errors
            .filter(e => !(e instanceof ApiBaseError))
            .forEach(e => this.store.dispatch(new ApiCommonErrorAction(e.constructor.name)));

          return Observable.of({ errors });
        })
    );
  }
}
