import { Action, createFeatureSelector, createSelector } from '@ngrx/store';

import { RequestState } from '~/core/api/request.models';
import { AuthTokenModel } from '~/core/api/auth.models';

export enum AuthRequestTypes {
  RequestCode = 'RequestCode',
  ConfirmCode = 'ConfirmCode'
}

export enum authActionTypes {
  REQUEST_CODE = 'AUTH_REQUEST_CODE',
  REQUEST_CODE_LOADING = 'AUTH_REQUEST_CODE_LOADING',
  REQUEST_CODE_ERROR = 'AUTH_REQUEST_CODE_ERROR',
  REQUEST_CODE_SUCCESS = 'AUTH_REQUEST_CODE_SUCCESS',

  CONFIRM_CODE = 'AUTH_CONFIRM_CODE',
  CONFIRM_CODE_LOADING = 'AUTH_CONFIRM_CODE_LOADING',
  CONFIRM_CODE_ERROR = 'AUTH_CONFIRM_CODE_ERROR',
  CONFIRM_CODE_SUCCESS = 'AUTH_CONFIRM_CODE_SUCCESS'
}

export class RequestCodeAction implements Action {
  readonly type = authActionTypes.REQUEST_CODE;
  readonly requestState = RequestState.NotStarted;
  readonly requestType = AuthRequestTypes.RequestCode;
  constructor(public phone: string) {}
}

export class RequestCodeLoadingAction implements Action {
  readonly type = authActionTypes.REQUEST_CODE_LOADING;
  readonly requestState = RequestState.Loading;
}

export class RequestCodeErrorAction implements Action {
  readonly type = authActionTypes.REQUEST_CODE_ERROR;
  readonly requestState = RequestState.Failed;
  constructor(public error: Error) {}
}

export class RequestCodeSuccessAction implements Action {
  readonly type = authActionTypes.REQUEST_CODE_SUCCESS;
  readonly requestState = RequestState.Succeded;
}

export class ConfirmCodeAction implements Action {
  readonly type = authActionTypes.CONFIRM_CODE;
  readonly requestState = RequestState.NotStarted;
  readonly requestType = AuthRequestTypes.ConfirmCode;
  constructor(public code: string) {}
}

export class ConfirmCodeLoadingAction implements Action {
  readonly type = authActionTypes.CONFIRM_CODE_LOADING;
  readonly requestState = RequestState.Loading;
}

export class ConfirmCodeErrorAction implements Action {
  readonly type = authActionTypes.CONFIRM_CODE_ERROR;
  readonly requestState = RequestState.Failed;
  constructor(public error: Error) {}
}

export class ConfirmCodeSuccessAction implements Action {
  readonly type = authActionTypes.CONFIRM_CODE_SUCCESS;
  readonly requestState = RequestState.Succeded;
  constructor(public token: AuthTokenModel) {}
}

type Actions =
  | RequestCodeAction
  | RequestCodeLoadingAction
  | RequestCodeSuccessAction
  | RequestCodeErrorAction
  | ConfirmCodeAction
  | ConfirmCodeLoadingAction
  | ConfirmCodeSuccessAction
  | ConfirmCodeErrorAction;

export interface AuthState {
  phone?: string;
  token?: AuthTokenModel;

  requestState: RequestState;
  requestType: AuthRequestTypes;
  error?: Error;
}

const initialState: AuthState = {
  requestState: RequestState.NotStarted,
  requestType: AuthRequestTypes.RequestCode
};

export function authReducer(state: AuthState = initialState, action: Actions): AuthState {
  switch (action.type) {
    case authActionTypes.REQUEST_CODE:
    case authActionTypes.CONFIRM_CODE:
      return {
        ...state,
        phone: action.type === authActionTypes.REQUEST_CODE ? action.phone : state.phone,
        requestType: action.requestType,

        // reset
        requestState: RequestState.NotStarted,
        error: undefined
      };

    case authActionTypes.REQUEST_CODE_LOADING:
    case authActionTypes.REQUEST_CODE_SUCCESS:
    case authActionTypes.CONFIRM_CODE_LOADING:
      return {
        ...state,
        requestState: action.requestState
      };

    case authActionTypes.REQUEST_CODE_ERROR:
    case authActionTypes.CONFIRM_CODE_ERROR:
      return {
        ...state,
        requestState: action.requestState,
        error: action.error
      };

    case authActionTypes.CONFIRM_CODE_SUCCESS:
      return {
        ...state,
        requestState: action.requestState,
        token: action.token
      };

    default:
      return state;
  }
}

export const authPath = 'auth';

const selectAuthFromState = createFeatureSelector<AuthState>(authPath);

export const selectPhone = createSelector(
  selectAuthFromState,
  (state: AuthState): string | undefined => state.phone
);

export const selectToken = createSelector(
  selectAuthFromState,
  (state: AuthState): AuthTokenModel | undefined => state.token
);

export const selectRequestCodeFailed = createSelector(
  selectAuthFromState,
  (state: AuthState): boolean =>
    state.requestType === AuthRequestTypes.RequestCode &&
    state.requestState === RequestState.Failed
);
