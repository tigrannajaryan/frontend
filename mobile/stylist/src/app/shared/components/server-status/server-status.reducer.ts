/**
 * State management for our server status.
 */

import { Action, createFeatureSelector } from '@ngrx/store';

/**
 * Possible actions that can be performed on serverStatus.
 */
export enum serverStatusActionTypes {
  onlineState = 'onlineState',
  serverReachability = 'serverReachability',
  serverInternalOrUnknownError = 'serverInternalOrUnknownError',
  serverIsOk = 'serverIsOk'
}

/**
 * The actual state that we store for serverStatus.
 */
export interface ServerStatusState {
  // Indicates that we are online (not yet used, requires network status detection)
  isOnline: boolean;

  // Indicates that the server is reachable (we received a response)
  isServerReachable: boolean;

  // Indicates that there was a general error response from server
  isServerError: boolean;
  serverErrorText: string;

  // Note: if (isOnline && isServerReachable && !isServerError) then
  // there is no known problem with the server. This means either
  // we received something successfully from the server or maybe we
  // didn't even try to contact it.
}

/**
 * The initial state when the app is just started.
 */
const initialState: ServerStatusState = {
  isOnline: true,
  isServerReachable: true,
  isServerError: false,
  serverErrorText: undefined
};

/**
 * Indicates that we received a successful response from the server.
 */
export class ServerIsOkAction implements Action {
  readonly type = serverStatusActionTypes.serverIsOk;
}

/**
 * The network connectivity state changed (not yet implemented,
 * no-one sends this action currently).
 */
export class ChangeOnlineModeAction implements Action {
  readonly type = serverStatusActionTypes.onlineState;
  constructor(readonly isOnline: boolean) { }
}

/**
 * We have a new information about server's reachability,
 * e.g. we either received a response (successful or failed)
 * or we received an error from network layer telling that
 * the request cannot be sent.
 */
export class ServerReachabilityAction implements Action {
  readonly type = serverStatusActionTypes.serverReachability;
  constructor(readonly isServerReachable: boolean) { }
}

/**
 * We received an error from the server.
 */
export class ServerErrorAction implements Action {
  readonly type = serverStatusActionTypes.serverInternalOrUnknownError;
  constructor(readonly errorText?: string) { }
}

export type ServerStatusActionsUnion =
  | ServerIsOkAction
  | ChangeOnlineModeAction
  | ServerReachabilityAction
  | ServerErrorAction;

/**
 * Reduces the current state and the action to a new state.
 */
export function serverStatusReducer(state: any = initialState, action: ServerStatusActionsUnion): ServerStatusState {

  switch (action.type) {
    case serverStatusActionTypes.serverIsOk:
      return { ...state, isOnline: true, isServerReachable: true, isServerError: false, serverErrorText: undefined };

    case serverStatusActionTypes.onlineState:
      return { ...state, isOnline: action.isOnline };

    case serverStatusActionTypes.serverReachability:
      return { ...state, isServerReachable: action.isServerReachable };

    case serverStatusActionTypes.serverInternalOrUnknownError:
      return { ...state, isServerError: true, serverErrorText: action.errorText };

    default:
      return state;
  }
}

export const serverStatusStateName = 'serverStatus';

export const selectServerStatusState = createFeatureSelector<ServerStatusState>(serverStatusStateName);
