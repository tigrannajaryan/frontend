import { ErrorHandler, Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Actions, Effect } from '@ngrx/effects';

import { authActionTypes, LogoutAction } from '~/shared/storage/auth.reducer';
import { deleteToken } from '~/shared/storage/token-utils';
import { DataStore } from '~/core/utils/data-store';
import { DataModule } from '~/core/api/data.module';
import { AppModule } from '~/app.module';
import { EventTypes } from '~/core/event-types';

@Injectable()
export class LogoutEffects {

  @Effect({ dispatch: false }) onLogout = this.actions
    .ofType(authActionTypes.USER_LOGOUT)
    .map(async (action: LogoutAction) => {
      try {
        // Remove token:
        await deleteToken();
        // Clear all DataStores to reset requests caches:
        this.clearAllDataStores();
        // Call success callback if exists:
        if (action.onSuccess) {
          action.onSuccess();
        }
        // Let others know and handle logout event
        this.events.publish(EventTypes.logout);
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

  private clearAllDataStores = (): void => {
    // Get all data store classes:
    const dataStores = DataModule.forRoot().providers;
    // Require one by one and clear it’s data:
    for (const storeClass of dataStores) {
      const store = AppModule.injector.get(storeClass);
      if (store instanceof DataStore) {
        // Just calling DataStore.prototype.clear:
        store.clear();
      } else {
        // Search for DataStore as a prop and call DataStore.prototype.clear on it:
        for (const propName of Object.getOwnPropertyNames(store)) {
          const prop = store[propName];
          if (prop instanceof DataStore) {
            prop.clear();
          }
        }
      }
    }
  };
}
