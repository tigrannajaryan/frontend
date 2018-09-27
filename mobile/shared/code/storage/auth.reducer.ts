import { Action, ActionReducer, createFeatureSelector, createSelector, State } from '@ngrx/store';

import { RequestState } from '~/shared/api/request.models';
import { AuthTokenModel } from '~/shared/api/auth.models';
import { ApiError } from '~/shared/api-errors';

import { StylistModel } from '~/core/api/stylists.models';

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

  RESET_CONFIRM_CODE_ERROR = 'AUTH_RESET_CONFIRM_CODE_ERROR',

  USER_LOGOUT = 'AUTH_USER_LOGOUT'
}

export class RequestCodeAction implements Action {
  readonly type = authActionTypes.REQUEST_CODE;
  constructor(public phone: string) {}
}

export class RequestCodeLoadingAction implements Action {
  readonly type = authActionTypes.REQUEST_CODE_LOADING;
}

export class RequestCodeErrorAction implements Action {
  readonly type = authActionTypes.REQUEST_CODE_ERROR;
  constructor(public error: ApiError) {}
}

export class RequestCodeSuccessAction implements Action {
  readonly type = authActionTypes.REQUEST_CODE_SUCCESS;
  constructor(public timestamp?: number) {}
}

export class ConfirmCodeAction implements Action {
  readonly type = authActionTypes.CONFIRM_CODE;
  constructor(
    public phone: string,
    public code: string
  ) {}
}

export class ConfirmCodeLoadingAction implements Action {
  readonly type = authActionTypes.CONFIRM_CODE_LOADING;
}

export class ConfirmCodeErrorAction implements Action {
  readonly type = authActionTypes.CONFIRM_CODE_ERROR;
  constructor(public error: ApiError) {}
}

export class ConfirmCodeSuccessAction implements Action {
  readonly type = authActionTypes.CONFIRM_CODE_SUCCESS;
  constructor(
    public phone: string,
    public token: AuthTokenModel,
    public invitedBy: StylistModel | undefined
  ) {}
}

export class ResetConfirmCodeErrorAction implements Action {
  readonly type = authActionTypes.RESET_CONFIRM_CODE_ERROR;
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
  | ResetConfirmCodeErrorAction;

export interface AuthState {
  getCodeRequestState: RequestState;
  getCodeRequestError?: ApiError;
  getCodeRequestTimestamp?: number;

  confirmCodeRequestState: RequestState;
  confirmCodeRequestError?: ApiError;
}

const initialState: AuthState = {
  getCodeRequestState: RequestState.NotStarted,
  confirmCodeRequestState: RequestState.NotStarted
};

export function authReducer(state: AuthState = initialState, action: Actions): AuthState {
  switch (action.type) {
    case authActionTypes.REQUEST_CODE:
      return {
        ...state,
        getCodeRequestState: RequestState.NotStarted,
        getCodeRequestError: undefined
      };

    case authActionTypes.REQUEST_CODE_LOADING:
      return {
        ...state,
        getCodeRequestState: RequestState.Loading
      };

    case authActionTypes.REQUEST_CODE_ERROR:
      return {
        ...state,
        getCodeRequestState: RequestState.Failed,
        getCodeRequestError: action.error
      };

    case authActionTypes.REQUEST_CODE_SUCCESS:
      return {
        ...state,
        getCodeRequestState: RequestState.Succeeded,
        getCodeRequestTimestamp: action.timestamp || state.getCodeRequestTimestamp || Number(new Date())
      };

    case authActionTypes.CONFIRM_CODE:
      return {
        ...state,
        confirmCodeRequestState: RequestState.NotStarted,
        confirmCodeRequestError: undefined
      };

    case authActionTypes.CONFIRM_CODE_LOADING:
      return {
        ...state,
        confirmCodeRequestState: RequestState.Loading
      };

    case authActionTypes.CONFIRM_CODE_ERROR:
      return {
        ...state,
        confirmCodeRequestState: RequestState.Failed,
        confirmCodeRequestError: action.error
      };

    case authActionTypes.CONFIRM_CODE_SUCCESS:
      return {
        ...state,
        confirmCodeRequestState: RequestState.Succeeded
      };

    case authActionTypes.RESET_CONFIRM_CODE_ERROR:
      return {
        ...state,
        confirmCodeRequestError: undefined
      };

    default:
      return state;
  }
}

export const authPath = 'auth';

const selectAuthFromState = createFeatureSelector<AuthState>(authPath);

export const selectRequestCodeState = createSelector(
  selectAuthFromState,
  (state: AuthState): RequestState => state.getCodeRequestState
);

export const selectConfirmCodeState = createSelector(
  selectAuthFromState,
  (state: AuthState): RequestState => state.confirmCodeRequestState
);

export const selectConfirmCodeError = createSelector(
  selectAuthFromState,
  (state: AuthState): any => state.confirmCodeRequestError
);

// Next action and reducer used in app.reducer.ts
// to reset state completely when user logs out

export class LogoutAction implements Action {
  readonly type = authActionTypes.USER_LOGOUT;
  constructor(public onSuccess?: (...args: any[]) => any) {}
}

export function resetOnLogoutReducer(reducer: ActionReducer<State<any>>): ActionReducer<State<any>> {
  return (state: State<any>, action: any) => {
    if (action.type === authActionTypes.USER_LOGOUT) {
      state = undefined;
    }
    return reducer(state, action);
  };
}
