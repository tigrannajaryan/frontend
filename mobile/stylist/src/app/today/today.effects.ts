import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
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

@Injectable()
export class TodayEffects {

  @Effect()
  load = this.actions.ofType(todayActionTypes.START_LOAD)
    .map((action: LoadAction) => action)
    .switchMap(action => Observable.defer(withLoader(async () => {
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
    })));

  constructor(private actions: Actions,
              private todayService: TodayService,
              private store: Store<TodayState>) {
  }

}
