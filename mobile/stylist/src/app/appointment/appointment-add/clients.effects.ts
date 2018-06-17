import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { timer } from 'rxjs/observable/timer';
import { debounce } from 'rxjs/operators';

import { ClientsService } from '~/appointment/appointment-add/clients-service';

import {
  clientsActionTypes,
  SearchAction,
  SearchSuccessAction
} from './clients.reducer';

@Injectable()
export class ClientsEffects {

  @Effect() search = this.actions
    .ofType(clientsActionTypes.SEARCH)
    .pipe(debounce(() => timer(400)))
    .map((action: SearchAction) => action)
    .switchMap(action => Observable.defer(async () => {
      const { clients } = await this.clientsService.search(action.query);
      const firstThreeOnly = clients.slice(0, 3);
      return new SearchSuccessAction(firstThreeOnly);
    }));

  constructor(
    private actions: Actions,
    private clientsService: ClientsService
  ) {
  }
}
