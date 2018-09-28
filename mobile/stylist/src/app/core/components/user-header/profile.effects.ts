import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';

import { StylistServiceProvider } from '~/shared/stylist-api/stylist-service';
import { Logger } from '~/shared/logger';

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
      const { response, error } = await this.stylistService.getProfile().get();
      if (response) {
        return new LoadProfileSuccessAction(response);
      } else {
        this.logger.error(error);
        return new LoadProfileErrorAction(error);
      }
    }));

  constructor(
    private actions: Actions,
    private logger: Logger,
    private stylistService: StylistServiceProvider
  ) {
  }
}
