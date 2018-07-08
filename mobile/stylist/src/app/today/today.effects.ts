import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { TodayService } from './today.service';
import {
  LoadAction,
  LoadedAction,
  LoadErrorAction,
  todayActionTypes,
  TodayState
} from './today.reducer';

import { withLoader } from '~/core/utils/loading';
import { showAlert } from '~/core/utils/alert';
import { Logger } from '~/shared/logger';
import { map, mergeMap } from 'rxjs/operators';
import { defer } from 'rxjs/internal/observable/defer';

@Injectable()
export class TodayEffects {

  @Effect()
  load = this.actions.pipe(
    ofType(todayActionTypes.START_LOAD),
    map((action: LoadAction) => action),
    mergeMap(action => defer(withLoader(async () => {
      try {
      const today = await this.todayService.getToday();
      return new LoadedAction(today);
    } catch (error) {
      showAlert(
        'An error occurred',
        'Loading of today info failed',
        [{
          text: 'Retry',
          handler: () => this.store.dispatch(new LoadAction())
        }]
      );
      const logger = new Logger();
      logger.error(error);
      return new LoadErrorAction(error);
    }
    })))
  );

  constructor(private actions: Actions,
              private todayService: TodayService,
              private store: Store<TodayState>) {
  }

}
