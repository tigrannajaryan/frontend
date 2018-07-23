import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { StylistsServiceMock } from '~/core/api/stylists-service.mock';
import {
  SearchStylistsAction,
  SearchStylistsErrorAction,
  SearchStylistSuccessAction,
  selectStylists,
  stylistsActionTypes,
  StylistState
} from '~/core/reducers/stylists.reducer';

@Injectable()
export class StylistsEffects {

  @Effect() searchStylists = this.actions
    .ofType(stylistsActionTypes.SEARCH_STYLISTS)
    .map((action: SearchStylistsAction) => action)
    .withLatestFrom(this.store)
    .switchMap(([action, state]) => {
      const stylists = selectStylists(state);
      if (stylists) { // return from cache
        return Observable.of(new SearchStylistSuccessAction(stylists));
      }
      return this.stylistsService.search()
        .map(({ response, errors }) => {
          if (errors) {
            return new SearchStylistsErrorAction(errors);
          }
          return new SearchStylistSuccessAction(response.stylists);
        });
    });

  constructor(
    private actions: Actions,
    private store: Store<StylistState>,
    private stylistsService: StylistsServiceMock
  ) {
  }
}
