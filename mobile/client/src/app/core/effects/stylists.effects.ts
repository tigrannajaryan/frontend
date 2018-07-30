import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { debounce } from 'rxjs/operators';
import { timer } from 'rxjs/observable/timer';

import { StylistsService } from '~/core/api/stylists-service';
import {
  SearchStylistsAction,
  SearchStylistsErrorAction,
  SearchStylistSuccessAction,
  stylistsActionTypes,
  StylistState
} from '~/core/reducers/stylists.reducer';

export const SEARCHING_DELAY = 250;

@Injectable()
export class StylistsEffects {

  @Effect() searchStylists = this.actions
    .ofType(stylistsActionTypes.SEARCH_STYLISTS)
    .map((action: SearchStylistsAction) => action)
    .pipe(debounce(() => timer(SEARCHING_DELAY)))
    .withLatestFrom(this.store)
    .switchMap(([action, state]) =>
      this.stylistsService.search(action.query)
        .map(({ response, errors }) => {
          if (errors) {
            return new SearchStylistsErrorAction(errors);
          }
          // TODO: remove `.slice(0, 10)` when implementing portions
          return new SearchStylistSuccessAction(response.stylists.slice(0, 10));
        })
    );

  constructor(
    private actions: Actions,
    private store: Store<StylistState>,
    private stylistsService: StylistsService
  ) {
  }
}
