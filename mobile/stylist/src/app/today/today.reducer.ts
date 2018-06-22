import * as moment from 'moment';

import { Action, createFeatureSelector, createSelector } from '@ngrx/store';
import { Today } from './today.models';

export enum todayActionTypes {
  START_LOAD = 'TODAY_START_LOAD',
  LOADED = 'TODAY_LOADED',
  LOAD_ERROR = 'TODAY_LOAD_ERROR',
  TEMP_ADD_ACTION = 'TODAY_ADD',
  CHECKIN = 'TODAY_CHECKIN',
  CHECKOUT = 'TODAY_CHECKOUT'
}

export interface TodayState {
  today: Today;
  loading: boolean;
  error: boolean;
}

const initialState: TodayState = {
  loading: false,
  error: false,
  today: undefined
};

export class LoadAction implements Action {
  readonly type = todayActionTypes.START_LOAD;
}

export class LoadedAction implements Action {
  readonly type = todayActionTypes.LOADED;
  constructor(public today: Today) { }
}

export class LoadErrorAction implements Action {
  readonly type = todayActionTypes.LOAD_ERROR;
  constructor(public error: Error) { }
}

export class CheckoutAction implements Action {
  readonly type = todayActionTypes.CHECKOUT;
  constructor(public appointmentUuid: string) { }
}

export type ActionsUnion =
  | LoadAction
  | LoadedAction
  | CheckoutAction;

export function todayReducer(state: any = initialState, action: ActionsUnion): TodayState {

  switch (action.type) {
    case todayActionTypes.START_LOAD:
      return { ...state, loading: true };

    case todayActionTypes.LOADED:
      return { ...state, loading: false, today: action.today };

    case todayActionTypes.CHECKOUT:
      return { ...state, loading: true };

    default:
      return state;
  }
}

export const selectTodayState = createFeatureSelector<TodayState>('today');

export const selectRemainingVisitsTodayCount = createSelector(
  selectTodayState,
  (state: TodayState): number => {
    if (!state.today) {
      return 0;
    }
    return (
      state.today.today_appointments
        .filter(appointment => moment(appointment.datetime_start_at).isAfter(new Date()))
        .length
    );
  }
);
