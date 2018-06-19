import { Action, createFeatureSelector, createSelector } from '@ngrx/store';
import { AppointmentDateOffer } from '~/today/today.models';
import { Client } from '~/appointment/appointment-add/clients-models';
import { ServiceUuid } from '~/core/stylist-service/stylist-models.ts';

export enum appointmentDatesActionTypes {
  GET_DATES = 'APPOINTMENT_GET_DATES',
  GET_DATES_SUCCESS = 'APPOINTMENT_GET_DATES_SUCCESS',
  GET_DATES_ERROR = 'APPOINTMENT_GET_DATES_ERROR',
  SELECT_DATE = 'APPOINTMENT_SELECT_DATE',
  CLEAR_DATE = 'APPOINTMENT_CLEAR_DATE'
}

export interface AppointmentDatesState {
  all: AppointmentDateOffer[];
  loaded: boolean;
  selected?: AppointmentDateOffer;
}

const initialState: AppointmentDatesState = {
  all: [],
  loaded: false,
  selected: undefined
};

export class GetDatesAction implements Action {
  readonly type = appointmentDatesActionTypes.GET_DATES;
  constructor(
    public service: ServiceUuid,
    public client?: Client
  ) { }
}

export class GetDatesSuccessAction implements Action {
  readonly type = appointmentDatesActionTypes.GET_DATES_SUCCESS;
  constructor(public days: AppointmentDateOffer[]) { }
}

export class GetDatesErrorAction implements Action {
  readonly type = appointmentDatesActionTypes.GET_DATES_ERROR;
  constructor(public error: Error) { }
}

export class SelectDateAction implements Action {
  readonly type = appointmentDatesActionTypes.SELECT_DATE;
  constructor(public date: AppointmentDateOffer) { }
}

export class ClearSelectedDateAction implements Action {
  readonly type = appointmentDatesActionTypes.CLEAR_DATE;
}

type Actions =
  | GetDatesAction
  | GetDatesSuccessAction
  | GetDatesErrorAction
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

export const selectDatesOffers = createSelector(
  selectAppointmentDates,
  (state: AppointmentDatesState): AppointmentDateOffer[] => state.all
);

export const selectSelectedDate = createSelector(
  selectAppointmentDates,
  (state: AppointmentDatesState): AppointmentDateOffer => state.selected
);
