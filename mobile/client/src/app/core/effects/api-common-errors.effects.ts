import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { PageNames } from '~/core/page-names';

import {
  ApiError,
  BaseError,
  RequestUnauthorizedError
} from '~/core/api/errors.models';

export const API_COMMON_ERROR = 'API_COMMON_ERROR';

export class ApiCommonErrorAction implements Action {
  readonly type = API_COMMON_ERROR;

  constructor(public error: BaseError) {}

  getError(): ApiError | Error {
    return this.error.error;
  }
}

@Injectable()
export class ApiCommonErrorsEffects {

  @Effect({ dispatch: false }) handleApiCommonError = this.actions
    .ofType(API_COMMON_ERROR)
    .map((action: ApiCommonErrorAction) => {

      switch (action.error.constructor.name) {
        case RequestUnauthorizedError.name: {
          const [ nav ] = this.app.getActiveNavs();
          nav.setRoot(PageNames.Auth);
          break;
        }

        default:
          // Just ignoring the error
      }
    });

  constructor(
    private actions: Actions,
    private app: App
  ) {}
}
