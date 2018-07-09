import { Action } from '@ngrx/store';

export enum errorsActionTypes {
  API_ERROR = 'API_ERROR',
  UNHANDLED_ERROR = 'UNHANDLED_ERROR'
}

export interface ErrorAction extends Action {
  error: Error;
}

export class ApiErrorAction implements ErrorAction {
  readonly type = errorsActionTypes.API_ERROR;
  constructor(public error: Error) {}
}

export class UnhandledErrorAction implements ErrorAction {
  readonly type = errorsActionTypes.UNHANDLED_ERROR;
  constructor(public error: Error) {}
}

// Errors are handled by errors.effects.
// We don’t need to export a reducer for it. If we do, it could be writed as:
//
// function errorsReducer(state: any): any {
//   return state;
// }
