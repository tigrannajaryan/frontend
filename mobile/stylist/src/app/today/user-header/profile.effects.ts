import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { showAlert } from '~/core/utils/alert';
import { Logger } from '~/shared/logger';

import {
  LoadAction,
  LoadErrorAction,
  LoadSuccessAction,
  profileActionTypes
} from '~/today/user-header/profile.reducer';

@Injectable()
export class ProfileEffects {

  @Effect() load = this.actions
    .ofType(profileActionTypes.LOAD)
    .map((action: LoadAction) => action)
    .switchMap(() => Observable.defer(async () => {
      try {
        const profile = await this.stylistService.getProfile();
        return new LoadSuccessAction(profile);
      } catch (error) {
        showAlert('Loading profile failed', error.message);
        const logger = new Logger();
        logger.error(error);
        return new LoadErrorAction(error);
      }
    }));

    constructor(
      private actions: Actions,
      private stylistService: StylistServiceProvider
    ) {
    }
}
