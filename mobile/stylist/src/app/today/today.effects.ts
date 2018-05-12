import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Actions, Effect } from '@ngrx/effects';
import { TodayService } from './today.service';
import { CheckinAction, LoadAction, todayActionTypes } from './today.reducer';

@Injectable()
export class TodayEffects {

  @Effect()
  load = this.actions.ofType(todayActionTypes.START_LOAD)
    .map((action: LoadAction) => action)
    .switchMap(action => this.todayService.load()
      .then(response => ({ type: todayActionTypes.LOADED, today: response }))
      .catch(() => Observable.of({ type: todayActionTypes.LOAD_ERROR }))
    );

  @Effect()
  checkin = this.actions.ofType(todayActionTypes.CHECKIN)
    .map((action: CheckinAction) => action)
    .switchMap(action => this.todayService.checkin(action.appointmentUuid)
      .then(response => ({ type: todayActionTypes.LOADED, today: response }))
      .catch(() => Observable.of({ type: todayActionTypes.LOAD_ERROR }))
    );

  constructor(private actions: Actions,
              private todayService: TodayService) {
  }

}
