import { Action, createFeatureSelector, createSelector } from '@ngrx/store';
import { AppointmentDate } from '~/appointment/appointment-date/appointment-dates-service-mock';
import { Client } from '~/appointment/appointment-add/clients-models';

export enum appointmentDatesActionTypes {
  GET_DATES = 'APPOINTMENT_GET_DATES',
  GET_DATES_SUCCESS = 'APPOINTMENT_GET_DATES_SUCCESS',
  SELECT_DATE = 'APPOINTMENT_SELECT_DATE',
  CLEAR_DATE = 'APPOINTMENT_CLEAR_DATE'
}

export interface AppointmentDatesState {
  all: AppointmentDate[];
  loaded: boolean;
  selected?: AppointmentDate;
}

const initialState: AppointmentDatesState = {
  all: [],
  loaded: false,
  selected: undefined
};

export class GetDatesAction implements Action {
  readonly type = appointmentDatesActionTypes.GET_DATES;
  constructor(public client?: Client) { }
}

export class GetDatesSuccessAction implements Action {
  readonly type = appointmentDatesActionTypes.GET_DATES_SUCCESS;
  constructor(public days: AppointmentDate[]) { }
}

export class SelectDateAction implements Action {
  readonly type = appointmentDatesActionTypes.SELECT_DATE;
  constructor(public date: AppointmentDate) { }
}

export class ClearSelectedDateAction implements Action {
  readonly type = appointmentDatesActionTypes.CLEAR_DATE;
}

type Actions =
  | GetDatesAction
  | GetDatesSuccessAction
  | SelectDateAction
  | ClearSelectedDateAction;

export function appointmentDatesReducer(state: AppointmentDatesState = initialState, action: Actions): AppointmentDatesState {
  switch (action.type) {
    case appointmentDatesActionTypes.GET_DATES_SUCCESS:
      return {
        ...state,
        all: action.days,
        loaded: true
      };

    case appointmentDatesActionTypes.SELECT_DATE:
      return {
        ...state,
        selected: action.date
      };

    case appointmentDatesActionTypes.CLEAR_DATE:
      return {
        ...state,
        selected: undefined
      };

    default:
      return state;
  }
}

export const appointmentDatesStatePath = 'appointmentDates';

export const selectAppointmentDates = createFeatureSelector<AppointmentDatesState>(appointmentDatesStatePath);

export const select2WeeksDays = createSelector(
  selectAppointmentDates,
  (state: AppointmentDatesState): AppointmentDate[] => state.all
);

export const selectSelectedDate = createSelector(
  selectAppointmentDates,
  (state: AppointmentDatesState): AppointmentDate => state.selected
);
