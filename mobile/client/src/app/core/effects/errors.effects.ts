import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { AlertController } from 'ionic-angular';

import { Logger } from '~/shared/logger';

import {
  ApiErrorAction,
  ErrorAction,
  errorsActionTypes,
  UnhandledErrorAction
} from '~/core/reducers/errors.reducer';

@Injectable()
export class ErrorsEffects {

  @Effect({ dispatch: false }) logApiError = this.actions
    .ofType(errorsActionTypes.API_ERROR)
    .map((action: ApiErrorAction) => {
      this.logError(action);
    });

  // TODO: show alert
  @Effect({ dispatch: false }) logUnhandledError = this.actions
    .ofType(errorsActionTypes.UNHANDLED_ERROR)
    .map((action: UnhandledErrorAction) => {
      this.logError(action);

      const alert = this.alertCtrl.create({
        title: 'An error occurred',
        // TODO: nicer subtitle
        subTitle: 'We are working on fixing it.',
        buttons: ['Dismiss']
      });
      alert.present();
    });

  constructor(
    private actions: Actions,
    private alertCtrl: AlertController,
    private logger: Logger
  ) {
  }

  private logError(action: ErrorAction): void {
    const { error } = action;
    // TODO:
    // 1. log
    // 2. sentry
    // 3. analytics
    this.logger.error(error);
  }
}
