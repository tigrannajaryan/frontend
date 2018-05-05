import { Action, createFeatureSelector } from '@ngrx/store';
import { AppointmentStatus, Today } from './today.models';

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
  constructor(public error: string) { }
}

export class CheckinAction implements Action {
  readonly type = todayActionTypes.CHECKIN;
  constructor(public appointmentUuid: string) { }
}

export class TempAddAction implements Action {
  readonly type = todayActionTypes.TEMP_ADD_ACTION;
}

export type ActionsUnion =
  | LoadAction
  | LoadedAction
  | LoadErrorAction
  | TempAddAction
  | CheckinAction;

export function todayReducer(state: any = initialState, action: ActionsUnion): TodayState {

  switch (action.type) {
    case todayActionTypes.START_LOAD:
      return { ...state, loading: true };

    case todayActionTypes.LOADED:
      return { ...state, loading: false, today: action.today };

    case todayActionTypes.CHECKIN:
      return { ...state, loading: true };

    case todayActionTypes.LOAD_ERROR:
      return { ...state, loading: false };

    case todayActionTypes.TEMP_ADD_ACTION:
      const appointments: AppointmentStatus[] = [
        { appointmentUuid: '', start_time: '1:00', duration_sec: 600, client_name: 'Peper White' },
        { appointmentUuid: '', start_time: '1:00', duration_sec: 600, client_name: 'Bebe Black' }
      ];
      const today = { appointments };

      return { ...state, today };

    default:
      return state;
  }
}

export const selectTodayState = createFeatureSelector<TodayState>('today');
