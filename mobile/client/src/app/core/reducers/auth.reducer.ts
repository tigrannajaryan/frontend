import { Action, ActionReducer, createFeatureSelector, createSelector, State } from '@ngrx/store';

import { RequestState } from '~/core/api/request.models';
import { AuthTokenModel } from '~/core/api/auth.models';
import { StylistModel } from '~/core/api/stylists.models';
import { ApiError } from '~/core/api/errors.models';

export enum AuthRequestTypes {
  RequestCode = 'RequestCode',
  ConfirmCode = 'ConfirmCode'
}

// TODO: refactor, combine with request states
export enum AuthSendCodeState {
  Timeout = 'Timeout',
  NotStarted = 'NotStarted',
  InProgress = 'InProgress'
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

  CLEAR_SEND_CODE_TIMEOUT = 'AUTH_CLEAR_SEND_CODE_TIMEOUT',

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
  constructor(public errors: ApiError[]) {}
}

export class RequestCodeSuccessAction implements Action {
  readonly type = authActionTypes.REQUEST_CODE_SUCCESS;
  readonly requestState = RequestState.Succeeded;
  readonly requestType = AuthRequestTypes.RequestCode;
  constructor(public timestamp?: number) {}
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
  constructor(public errors: ApiError[]) {}
}

export class ConfirmCodeSuccessAction implements Action {
  readonly type = authActionTypes.CONFIRM_CODE_SUCCESS;
  readonly requestState = RequestState.Succeeded;
  readonly requestType = AuthRequestTypes.ConfirmCode;
  constructor(
    public token: AuthTokenModel,
    public invitedBy: StylistModel | undefined
  ) {}
}

export class ClearSendCodeTimeout implements Action {
  readonly type = authActionTypes.CLEAR_SEND_CODE_TIMEOUT;
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
  | ClearSendCodeTimeout;

export interface AuthState {
  phone?: string;
  token?: AuthTokenModel;

  codeRequestTimestamp?: number;
  sendCodeState: AuthSendCodeState;

  requestState: RequestState;
  requestType: AuthRequestTypes;
  errors?: ApiError[];
}

const initialState: AuthState = {
  phone: undefined,
  token: undefined,

  codeRequestTimestamp: undefined,
  sendCodeState: AuthSendCodeState.NotStarted,

  requestState: RequestState.NotStarted,
  requestType: AuthRequestTypes.RequestCode,
  errors: undefined
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
        errors: undefined
      };

    case authActionTypes.REQUEST_CODE_LOADING:
      return {
        ...state,
        requestState: action.requestState,
        requestType: action.requestType,

        sendCodeState: AuthSendCodeState.InProgress
      };

    case authActionTypes.CONFIRM_CODE_LOADING:
      return {
        ...state,
        requestState: action.requestState,
        requestType: action.requestType
      };

    case authActionTypes.REQUEST_CODE_SUCCESS:
      return {
        ...state,

        codeRequestTimestamp: action.timestamp || state.codeRequestTimestamp || Number(new Date()),
        sendCodeState: AuthSendCodeState.Timeout,

        requestState: action.requestState,
        requestType: action.requestType
      };

    case authActionTypes.REQUEST_CODE_ERROR:
    case authActionTypes.CONFIRM_CODE_ERROR:
      return {
        ...state,
        requestState: action.requestState,
        errors: action.errors
      };

    case authActionTypes.CONFIRM_CODE_SUCCESS:
      return {
        ...state,
        requestState: action.requestState,
        token: action.token
      };

    case authActionTypes.CLEAR_SEND_CODE_TIMEOUT:
      return {
        ...state,

        sendCodeState: AuthSendCodeState.NotStarted
      };

    default:
      return state;
  }
}

export function resetOnLogoutReducer(reducer: ActionReducer<State<any>>): ActionReducer<State<any>> {
  return (state: State<any>, action: any) => {
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

export const selectFormattedPhone = createSelector(
  selectAuthFromState,
  (state: AuthState): string | undefined => state.phone
);

export const selectToken = createSelector(
  selectAuthFromState,
  (state: AuthState): AuthTokenModel | undefined => state.token
);

export const selectConfirmCodeErrors = createSelector(
  selectAuthFromState,
  (state: AuthState): any =>
    state.requestType === AuthRequestTypes.ConfirmCode &&
    state.errors
);

export const selectRequestCodeLoading = createSelector(
  selectAuthFromState,
  (state: AuthState): boolean =>
    state.requestType === AuthRequestTypes.RequestCode &&
    state.requestState === RequestState.Loading
);

export const selectRequestCodeSucceeded = createSelector(
  selectAuthFromState,
  (state: AuthState): boolean =>
    state.requestType === AuthRequestTypes.RequestCode &&
    state.requestState === RequestState.Succeeded
);

export const selectConfirmCodeLoading = createSelector(
  selectAuthFromState,
  (state: AuthState): boolean =>
    state.requestType === AuthRequestTypes.ConfirmCode &&
    state.requestState === RequestState.Loading
);

export const selectConfirmCodeSucceeded = createSelector(
  selectAuthFromState,
  (state: AuthState): boolean =>
    state.requestType === AuthRequestTypes.ConfirmCode &&
    state.requestState === RequestState.Succeeded
);

export const RESEND_CODE_TIMEOUT_SECONDS = 120; // 2min

export const selectCanRequestCodeInSeconds = (timestamp = Number(new Date())) => createSelector(
  selectAuthFromState,
  (state: AuthState): number => {
    if (state.codeRequestTimestamp !== undefined) {
      const seconds = Math.ceil(RESEND_CODE_TIMEOUT_SECONDS - (timestamp - state.codeRequestTimestamp) / 1000);
      return seconds > 0 ? seconds : 0;
    }
    return 0; // can request now
  }
);

export const selectCanRequestCode = (timestamp = undefined) => createSelector(
  selectCanRequestCodeInSeconds(timestamp),
  (seconds: number): boolean => seconds === 0
);

export const selectSendCodeState = createSelector(
  selectAuthFromState,
  (state: AuthState): AuthSendCodeState => state.sendCodeState
);
