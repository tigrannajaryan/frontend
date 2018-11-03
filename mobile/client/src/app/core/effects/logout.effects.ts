import { ErrorHandler, Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Actions, Effect } from '@ngrx/effects';

import { authActionTypes, LogoutAction } from '~/shared/storage/auth.reducer';
import { deleteAuthLocalData } from '~/shared/storage/token-utils';
import { DataStore } from '~/shared/storage/data-store';
import { DataModule } from '~/core/api/data.module';
import { AppModule } from '~/app.module';
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
        this.clearAllDataStores();
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
