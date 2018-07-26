import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { Logger } from '~/shared/logger';

import {
  LoadProfileAction,
  LoadProfileErrorAction,
  LoadProfileSuccessAction,
  profileActionTypes
} from '~/core/reducers/profile.reducer';
import { showAlert } from '~/core/utils/alert';
import { StylistServiceProvider } from '~/core/api/stylist-service/stylist.api';

@Injectable()
export class ProfileEffects {

  @Effect() load = this.actions
    .ofType(profileActionTypes.LOAD)
    .map((action: LoadProfileAction) => action)
    .switchMap(() => Observable.defer(async () => {
      try {
        const profile = await this.stylistService.getProfile();
        return new LoadProfileSuccessAction(profile);
      } catch (error) {
        showAlert('Loading profile failed', error.message);
        const logger = new Logger();
        logger.error(error);
        return new LoadProfileErrorAction(error);
      }
    }));

    constructor(
      private actions: Actions,
      private stylistService: StylistServiceProvider
    ) {
    }
}
