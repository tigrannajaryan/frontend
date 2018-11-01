import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { debounce } from 'rxjs/operators';
import { timer } from 'rxjs/observable/timer';

import { StylistsService } from '~/core/api/stylists.service';
import {
  SearchStylistsAction,
  SearchStylistsErrorAction,
  SearchStylistSuccessAction,
  stylistsActionTypes,
  StylistState
} from '~/core/reducers/stylists.reducer';

@Injectable()
export class StylistsEffects {
  static SEARCHING_DELAY = 250;

  @Effect() searchStylists = this.actions
    .ofType(stylistsActionTypes.SEARCH_STYLISTS)
    .map((action: SearchStylistsAction) => action)
    .pipe(debounce(() => timer(StylistsEffects.SEARCHING_DELAY)))
    .withLatestFrom(this.store)
    .switchMap(([action]) =>
      this.stylistsService.search(action.params)
        .map(({ response, error }) => {
          if (error) {
            return new SearchStylistsErrorAction(error);
          }
          return new SearchStylistSuccessAction(response.stylists, response.more_results_available);
        })
    );

  constructor(
    private actions: Actions,
    private store: Store<StylistState>,
    private stylistsService: StylistsService
  ) {
  }
}
