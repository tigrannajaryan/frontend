import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { timer } from 'rxjs/observable/timer';
import { debounce } from 'rxjs/operators';

import { ClientsService } from '~/appointment/appointment-add/clients-service';
import { Logger } from '~/shared/logger';

import {
  clientsActionTypes,
  SearchAction,
  SearchErrorAction,
  SearchSuccessAction
} from './clients.reducer';

@Injectable()
export class ClientsEffects {

  @Effect() search = this.actions
    .ofType(clientsActionTypes.SEARCH)
    .map((action: SearchAction) => action)
    .filter(action => action.query.length >= 3)
    .pipe(debounce(() => timer(200)))
    .switchMap(action => Observable.defer(async () => {
      try {
        const { clients } = await this.clientsService.search(action.query);
        const firstThreeOnly = clients.slice(0, 3);
        return new SearchSuccessAction(firstThreeOnly);
      } catch (error) {
        const logger = new Logger();
        logger.error(error);
        return new SearchErrorAction(error);
      }
    }));

  constructor(
    private actions: Actions,
    private clientsService: ClientsService
  ) {
  }
}
