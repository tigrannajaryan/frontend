import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { showAlert } from '~/core/utils/alert';
import { Logger } from '~/shared/logger';

import {
  LoadProfileAction,
  LoadProfileErrorAction,
  LoadProfileSuccessAction,
  profileActionTypes
} from '~/core/components/user-header/profile.reducer';
import { map, switchMap } from 'rxjs/operators';
import { defer } from 'rxjs/internal/observable/defer';

@Injectable()
export class ProfileEffects {

  @Effect() load = this.actions
    .pipe(
      ofType(profileActionTypes.LOAD),
      map((action: LoadProfileAction) => action),
      switchMap(() => defer(async () => {
        try {
          const profile = await this.stylistService.getProfile();
          return new LoadProfileSuccessAction(profile);
        } catch (error) {
          showAlert('Loading profile failed', error.message);
          const logger = new Logger();
          logger.error(error);
          return new LoadProfileErrorAction(error);
        }
      }))
    );

    constructor(
      private actions: Actions,
      private stylistService: StylistServiceProvider
    ) {
    }
}
