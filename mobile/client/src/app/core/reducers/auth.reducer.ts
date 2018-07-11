import { Action, ActionReducer, createFeatureSelector, createSelector, State } from '@ngrx/store';

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
  CONFIRM_CODE_SUCCESS = 'AUTH_CONFIRM_CODE_SUCCESS',

  RESET = 'AUTH_RESET',
  USER_LOGOUT = 'AUTH_USER_LOGOUT'
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
  readonly requestType = AuthRequestTypes.RequestCode;
}

export class RequestCodeErrorAction implements Action {
  readonly type = authActionTypes.REQUEST_CODE_ERROR;
  readonly requestState = RequestState.Failed;
  readonly requestType = AuthRequestTypes.RequestCode;
  constructor(public error: Error) {}
}

export class RequestCodeSuccessAction implements Action {
  readonly type = authActionTypes.REQUEST_CODE_SUCCESS;
  readonly requestState = RequestState.Succeded;
  readonly requestType = AuthRequestTypes.RequestCode;
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
  readonly requestType = AuthRequestTypes.ConfirmCode;
}

export class ConfirmCodeErrorAction implements Action {
  readonly type = authActionTypes.CONFIRM_CODE_ERROR;
  readonly requestState = RequestState.Failed;
  readonly requestType = AuthRequestTypes.ConfirmCode;
  constructor(public error: Error) {}
}

export class ConfirmCodeSuccessAction implements Action {
  readonly type = authActionTypes.CONFIRM_CODE_SUCCESS;
  readonly requestState = RequestState.Succeded;
  readonly requestType = AuthRequestTypes.ConfirmCode;
  constructor(public token: AuthTokenModel) {}
}

export class ResetAction implements Action {
  readonly type = authActionTypes.RESET;
}

// used in meta reducer in app.reducer.ts
export class LogoutAction implements Action {
  readonly type = authActionTypes.USER_LOGOUT;
}

type Actions =
  | RequestCodeAction
  | RequestCodeLoadingAction
  | RequestCodeSuccessAction
  | RequestCodeErrorAction
  | ConfirmCodeAction
  | ConfirmCodeLoadingAction
  | ConfirmCodeSuccessAction
  | ConfirmCodeErrorAction
  | ResetAction;

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
    case authActionTypes.RESET:
      return {
        ...initialState
      };

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
        requestState: action.requestState,
        requestType: action.requestType
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

export function resetOnLogoutReducer(reducer: ActionReducer<State>): ActionReducer<State> {
  return (state: State, action: any) => {
    if (action.type === authActionTypes.USER_LOGOUT) {
      state = undefined;
    }
    return reducer(state, action);
  };
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

export const selectRequestCodeLoading = createSelector(
  selectAuthFromState,
  (state: AuthState): boolean =>
    state.requestType === AuthRequestTypes.RequestCode &&
    state.requestState === RequestState.Loading
);

export const selectRequestCodeSucceded = createSelector(
  selectAuthFromState,
  (state: AuthState): boolean =>
    state.requestType === AuthRequestTypes.RequestCode &&
    state.requestState === RequestState.Succeded
);

export const selectConfirmCodeLoading = createSelector(
  selectAuthFromState,
  (state: AuthState): boolean =>
    state.requestType === AuthRequestTypes.ConfirmCode &&
    state.requestState === RequestState.Loading
);

export const selectConfirmCodeSucceded = createSelector(
  selectAuthFromState,
  (state: AuthState): boolean =>
    state.requestType === AuthRequestTypes.ConfirmCode &&
    state.requestState === RequestState.Succeded
);
