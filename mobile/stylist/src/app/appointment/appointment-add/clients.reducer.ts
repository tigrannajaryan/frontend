import { Action, createFeatureSelector, createSelector } from '@ngrx/store';
import { Client } from '~/appointment/appointment-add/clients-models';

export enum clientsActionTypes {
  SEARCH = 'CLIENTS_SEARCH',
  SEARCH_SUCCESS = 'CLIENTS_SEARCH_SUCCESS',
  CLEAR = 'CLIENTS_CLEAR'
}

export interface ClientsState {
  all: Client[];
}

const initialState: ClientsState = {
  all: []
};

export class SearchAction implements Action {
  readonly type = clientsActionTypes.SEARCH;
  constructor(public query: string) { }
}

export class SearchSuccessAction implements Action {
  readonly type = clientsActionTypes.SEARCH_SUCCESS;
  constructor(public clients: Client[]) { }
}

export class ClearClientsAction implements Action {
  readonly type = clientsActionTypes.CLEAR;
}

type Actions =
  | SearchAction
  | SearchSuccessAction
  | ClearClientsAction;

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

    default:
      return state;
  }
}

export const selectClients = createFeatureSelector<ClientsState>('clients');

export const selectFoundClients = createSelector(
  selectClients,
  (state: ClientsState): Client[] => state.all
);
