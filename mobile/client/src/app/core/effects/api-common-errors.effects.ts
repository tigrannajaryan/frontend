import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { PageNames } from '~/core/page-names';

import {
  ApiError,
  ApiRequestUnauthorizedError
} from '~/core/api/errors.models';

export const API_COMMON_ERROR = 'API_COMMON_ERROR';

export class ApiCommonErrorAction implements Action {
  readonly type = API_COMMON_ERROR;
  constructor(public error: ApiError) {}
}

@Injectable()
export class ApiCommonErrorsEffects {

  /**
   * Handle different types of API errors with `handleGlobally()` flag set to ”true”
   */
  @Effect({ dispatch: false }) handleApiCommonError = this.actions
    .ofType(API_COMMON_ERROR)
    .map((action: ApiCommonErrorAction) => {

      if (action.error instanceof ApiRequestUnauthorizedError) {
        const [ nav ] = this.app.getActiveNavs();
        nav.setRoot(PageNames.Auth);
      }
    });

  constructor(
    private actions: Actions,
    private app: App
  ) {}
}
