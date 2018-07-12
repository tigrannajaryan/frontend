import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { Action, Actions, Effect } from '@ngrx/effects';

import { PageNames } from '~/core/page-names';

import {
  RequestUnauthorizedError
} from '~/core/api/errors.models';

export const API_COMMON_ERROR = 'API_COMMON_ERROR';

export class ApiCommonErrorAction implements Action {
  readonly type = API_COMMON_ERROR;
  constructor(public errorConstructorName: string) {}
}

@Injectable()
export class ApiErrorsEffects {

  @Effect({ dispatch: false }) handleApiCommonError = this.actions
    .ofType(API_COMMON_ERROR)
    .map((action: ApiCommonErrorAction) => {

      switch (action.errorConstructorName) {
        case RequestUnauthorizedError.name: {
          const [ nav ] = this.app.getActiveNavs();
          nav.setRoot(PageNames.Auth);
          break;
        }

        default:
          // Just ignoring an error
      }
    });

  constructor(
    private actions: Actions,
    private app: App
  ) {}
}
