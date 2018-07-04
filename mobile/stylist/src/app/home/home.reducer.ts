import { Action, createFeatureSelector } from '@ngrx/store';
import { Home } from './home.models';

export enum HomeActionTypes {
  HOME_START_LOAD = 'HOME_START_LOAD',
  HOME_LOADED = 'HOME_LOADED',
  HOME_LOAD_ERROR = 'HOME_LOAD_ERROR',
  HOME_CHECKOUT = 'HOME_CHECKOUT'
}

export interface HomeState {
  loading: boolean;
  error: boolean;
  home: Home;
}

const initialState: HomeState = {
  loading: false,
  error: false,
  home: undefined
};

export class HomeLoadAction implements Action {
  readonly type = HomeActionTypes.HOME_START_LOAD;
  constructor(public query: string) { }
}

export class HomeLoadedAction implements Action {
  readonly type = HomeActionTypes.HOME_LOADED;
  constructor(public home: Home) { }
}

export class HomeLoadErrorAction implements Action {
  readonly type = HomeActionTypes.HOME_LOAD_ERROR;
  constructor(public error: Error) { }
}

export type ActionsUnion =
  | HomeLoadAction
  | HomeLoadedAction;

export function homeReducer(state: any = initialState, action: ActionsUnion): HomeState {
  switch (action.type) {
    case HomeActionTypes.HOME_START_LOAD:
      return { ...state, loading: true };

    case HomeActionTypes.HOME_LOADED:
      return { ...state, loading: false, home: action.home };

    default:
      return state;
  }
}

export const selectHomeState = createFeatureSelector<HomeState>('home');
