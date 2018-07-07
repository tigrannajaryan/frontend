import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { timer } from 'rxjs/observable/timer';
import { debounce, filter, map, switchMap } from 'rxjs/operators';

import { ClientsService } from '~/appointment/appointment-add/clients-service';
import { Logger } from '~/shared/logger';

import {
  clientsActionTypes,
  SearchAction,
  SearchErrorAction,
  SearchSuccessAction
} from './clients.reducer';
import { defer } from 'rxjs/internal/observable/defer';

@Injectable()
export class ClientsEffects {

  @Effect() search = this.actions
    .pipe(
      ofType(clientsActionTypes.SEARCH),
      map((action: SearchAction) => action),
      filter(action => action.query.length >= 3),
      debounce(() => timer(200)),
      switchMap(action => defer(async () => {
        try {
        const { clients } = await this.clientsService.search(action.query);
        const firstThreeOnly = clients.slice(0, 3);
        return new SearchSuccessAction(firstThreeOnly);
      } catch (error) {
        const logger = new Logger();
        logger.error(error);
        return new SearchErrorAction(error);
      }
      }))
    );

  constructor(
    private actions: Actions,
    private clientsService: ClientsService
  ) {
  }
}
