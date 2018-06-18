import { Action, createFeatureSelector, createSelector } from '@ngrx/store';
import { Client } from '~/appointment/appointment-add/clients-models';

export enum clientsActionTypes {
  SEARCH = 'CLIENTS_SEARCH',
  SEARCH_SUCCESS = 'CLIENTS_SEARCH_SUCCESS',
  SEARCH_ERROR = 'CLIENTS_SEARCH_ERROR',
  CLEAR = 'CLIENTS_CLEAR',
  SELECT_CLIENT = 'CLIENTS_SELECT_CLIENT',
  CLEAR_CLIENT = 'CLIENTS_CLEAR_CLIENT'
}

export interface ClientsState {
  all: Client[];
  selected?: Client;
}

const initialState: ClientsState = {
  all: [],
  selected: undefined
};

export class SearchAction implements Action {
  readonly type = clientsActionTypes.SEARCH;
  constructor(public query: string) { }
}

export class SearchSuccessAction implements Action {
  readonly type = clientsActionTypes.SEARCH_SUCCESS;
  constructor(public clients: Client[]) { }
}

export class SearchErrorAction implements Action {
  readonly type = clientsActionTypes.SEARCH_ERROR;
  constructor(public error: Error) { }
}

export class ClearClientsAction implements Action {
  readonly type = clientsActionTypes.CLEAR;
}

export class SelectClientAction implements Action {
  readonly type = clientsActionTypes.SELECT_CLIENT;
  constructor(public client: Client) { }
}

export class ClearSelectedClientAction implements Action {
  readonly type = clientsActionTypes.CLEAR_CLIENT;
}

type Actions =
  | SearchAction
  | SearchSuccessAction
  | SearchErrorAction
  | ClearClientsAction
  | SelectClientAction
  | ClearSelectedClientAction;

export function clientsReducer(state: ClientsState = initialState, action: Actions): ClientsState {
  switch (action.type) {
    case clientsActionTypes.SEARCH_SUCCESS:
      return {
        ...state,
        all: action.clients
      };

    case clientsActionTypes.CLEAR:
      return {
        ...state,
        all: []
      };

    case clientsActionTypes.SELECT_CLIENT:
      return {
        ...state,
        selected: action.client
      };

    case clientsActionTypes.CLEAR_CLIENT:
      return {
        ...state,
        selected: undefined
      };

    default:
      return state;
  }
}

export const selectClients = createFeatureSelector<ClientsState>('clients');

export const selectFoundClients = createSelector(
  selectClients,
  (state: ClientsState): Client[] => state.all
);

export const selectSelectedClient = createSelector(
  selectClients,
  (state: ClientsState): Client => state.selected
);
