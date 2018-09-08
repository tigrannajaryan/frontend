import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { Logger } from '@madebeauty/utils';

import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';

import {
  LoadProfileAction,
  LoadProfileErrorAction,
  LoadProfileSuccessAction,
  profileActionTypes
} from '~/core/components/user-header/profile.reducer';

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
