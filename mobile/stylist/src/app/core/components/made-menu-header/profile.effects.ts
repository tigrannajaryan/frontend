import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { defer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { StylistServiceProvider } from '~/core/api/stylist.service';
import { Logger } from '~/shared/logger';

import {
  LoadProfileAction,
  LoadProfileErrorAction,
  LoadProfileSuccessAction,
  profileActionTypes
} from '~/core/components/made-menu-header/profile.reducer';

@Injectable()
export class ProfileEffects {

  @Effect() load = this.actions
    .pipe(
      ofType(profileActionTypes.LOAD),
      map((action: LoadProfileAction) => action),
      switchMap(() => defer(async () => {
        const { response, error } = await this.stylistService.getProfile().get();
        if (response) {
          return new LoadProfileSuccessAction(response);
        } else {
          this.logger.error(error);
          return new LoadProfileErrorAction(error);
        }
      }))
    );

  constructor(
    private actions: Actions,
    private logger: Logger,
    private stylistService: StylistServiceProvider
  ) {
  }
}
