import { ErrorHandler, Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { PageNames } from '~/core/page-names';
import { ApiClientError, ApiError, HttpStatus } from '~/shared/api-errors';

export const API_COMMON_ERROR = 'API_COMMON_ERROR';

export class ApiCommonErrorAction implements Action {
  readonly type = API_COMMON_ERROR;
  constructor(public error: ApiError) { }
}

@Injectable()
export class ApiCommonErrorsEffects {

  /**
   * Handle different types of API errors with `handleGlobally()` flag set to ”true”
   */
  @Effect({ dispatch: false }) handleApiCommonError = this.actions
    .ofType(API_COMMON_ERROR)
    .map((action: ApiCommonErrorAction) => {

      if (action.error instanceof ApiClientError &&
        action.error.status === HttpStatus.unauthorized) {
        const [nav] = this.app.getActiveNavs();
        nav.setRoot(PageNames.Auth);
        return;
      }

      this.errorHandler.handleError(action.error);
    });

  constructor(
    private actions: Actions,
    private app: App,
    private errorHandler: ErrorHandler
  ) { }
}
