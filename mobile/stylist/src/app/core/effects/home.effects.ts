import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { Logger } from '~/shared/logger';

import {
  HomeActionTypes,
  HomeLoadAction,
  HomeLoadedAction,
  HomeLoadErrorAction,
  HomeState
} from '../reducers/home.reducer';
import { showAlert } from '~/core/utils/alert';
import { HomeService } from '~/core/api/home/home.service';

@Injectable()
export class HomeEffects {

  @Effect()
  loadHome = this.actions.ofType(HomeActionTypes.HOME_START_LOAD)
    .map((action: HomeLoadAction) => action)
    .switchMap((action: HomeLoadAction) => Observable.defer(async () => {
      try {
        const home = await this.homeService.getHome(action.query);
        return new HomeLoadedAction(home);
      } catch (error) {
        showAlert(
          'An error occurred',
          'Loading of home info failed',
          [{
            text: 'Retry',
            handler: () => this.store.dispatch(new HomeLoadAction(action.query))
          }]
        );
        const logger = new Logger();
        logger.error(error);
        return new HomeLoadErrorAction(error);
      }
    }));

  constructor(private actions: Actions,
              private homeService: HomeService,
              private store: Store<HomeState>) {
  }

}
