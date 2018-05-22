import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Actions, Effect } from '@ngrx/effects';
import { TodayService } from './today.service';
import { LoadAction, todayActionTypes } from './today.reducer';

@Injectable()
export class TodayEffects {

  @Effect()
  load = this.actions.ofType(todayActionTypes.START_LOAD)
    .map((action: LoadAction) => action)
    .switchMap(action => this.todayService.getToday()
      .then(response => ({ type: todayActionTypes.LOADED, today: response }))
      .catch(() => Observable.of({ type: todayActionTypes.LOAD_ERROR }))
    );

  constructor(private actions: Actions,
              private todayService: TodayService) {
  }

}
