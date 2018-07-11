import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as faker from 'faker';

import {
  ConfirmCodeParams,
  ConfirmCodeResponse,
  GetCodeParams,
  GetCodeResponse
} from '~/core/api/auth.models';
import { ApiErrorAction } from '~/core/reducers/errors.reducer';

import AuthErrors from '~/core/data/auth.errors.json';

@Injectable()
export class AuthServiceMock {

  constructor(
    private store: Store<any>
  ) {
  }

  getCode(params: GetCodeParams): Observable<GetCodeResponse> {
    return this.wrapError<GetCodeResponse>(
      Observable.create(observer => {
        setTimeout(() => {
          observer.next({});
          // observer.error(new Error('403'));
        }, 3200);
      })
    );
  }

  confirmCode(params: ConfirmCodeParams): Observable<ConfirmCodeResponse> {
    return this.wrapError<ConfirmCodeResponse>(
      Observable.create(observer => {
        setTimeout(() => {
          observer.next({
            token: faker.internet.password(),
            created_at: Number(new Date())
          });
          // observer.error(AuthErrors.invalid_code);
         }, 2000);
      })
    );
  }

  private wrapError<ResponseType>(requestMock: Observable<ResponseType>): Observable<ResponseType> {
    return requestMock.catch(error => {
      // TODO: react to 401 unauthorized –> nav.setRoot(Auth)
      this.store.dispatch(new ApiErrorAction(error));
      return Observable.throw(error);
    });
  }
}
