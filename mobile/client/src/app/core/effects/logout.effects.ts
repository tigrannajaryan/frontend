import { ErrorHandler, Injectable } from '@angular/core';
import { App, LoadingController } from 'ionic-angular';
import { Actions, Effect } from '@ngrx/effects';

import { authActionTypes, LogoutAction } from '~/core/reducers/auth.reducer';
import { deleteToken } from '~/core/utils/token-utils';
import { UNAUTHORIZED_ROOT } from '~/core/page-names';

@Injectable()
export class LogoutEffects {

  @Effect({ dispatch: false }) onLogout = this.actions
    .ofType(authActionTypes.USER_LOGOUT)
    .map(async (action: LogoutAction) => {
      const loader = this.loader.create();
      loader.present();
      try {
        await deleteToken();
        if (action.onSuccess) {
          action.onSuccess();
        }
        this.app.getRootNav().setRoot(UNAUTHORIZED_ROOT);
      } catch (error) {
        this.errorHandler.handleError(error);
      } finally {
        loader.dismiss();
      }
    });

  constructor(
    private actions: Actions,
    private app: App,
    private errorHandler: ErrorHandler,
    private loader: LoadingController
  ) {
  }
}
