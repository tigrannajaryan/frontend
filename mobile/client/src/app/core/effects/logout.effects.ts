import { ErrorHandler, Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Actions, Effect } from '@ngrx/effects';

import { authActionTypes, LogoutAction } from '~/shared/storage/auth.reducer';
import { deleteAuthLocalData } from '~/shared/storage/token-utils';
import { clearAllDataStores } from '~/core/api/data.module';
import { SharedEventTypes } from '~/shared/events/shared-event-types';

@Injectable()
export class LogoutEffects {

  @Effect({ dispatch: false }) onLogout = this.actions
    .ofType(authActionTypes.USER_LOGOUT)
    .map(async (action: LogoutAction) => {
      try {
        this.events.publish(SharedEventTypes.beforeLogout);

        // Remove token:
        await deleteAuthLocalData();
        // Clear all DataStores to reset requests caches:
        await clearAllDataStores();
        // Call success callback if exists:
        if (action.onSuccess) {
          action.onSuccess();
        }
        // Let others know and handle logout event
        this.events.publish(SharedEventTypes.afterLogout);
      } catch (error) {
        this.errorHandler.handleError(error);
      }
    });

  constructor(
    private actions: Actions,
    private errorHandler: ErrorHandler,
    private events: Events
  ) {
  }
}
