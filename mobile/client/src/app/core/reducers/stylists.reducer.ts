import { Action, createFeatureSelector, createSelector } from '@ngrx/store';

import { RequestState } from '~/core/api/request.models';
import { ApiError } from '~/core/api/errors.models';
import { StylistModel } from '~/core/api/stylists.models';

import { authActionTypes, ConfirmCodeSuccessAction } from '~/core/reducers/auth.reducer';

export enum stylistsActionTypes {
  SEARCH_STYLISTS = 'STYLISTS_SEARCH_STYLISTS',
  SEARCH_STYLISTS_LOADING = 'STYLISTS_SEARCH_STYLISTS_LOADING',
  SEARCH_STYLISTS_ERROR = 'STYLISTS_SEARCH_STYLISTS_ERROR',
  SEARCH_STYLISTS_SUCCESS = 'STYLISTS_SEARCH_STYLISTS_SUCCESS'
}

export class SearchStylistsAction implements Action {
  readonly type = stylistsActionTypes.SEARCH_STYLISTS;
  readonly requestState = RequestState.NotStarted;
  constructor(public query?: string) {}
}

export class SearchStylistsLoadingAction implements Action {
  readonly type = stylistsActionTypes.SEARCH_STYLISTS_LOADING;
  readonly requestState = RequestState.Loading;
}

export class SearchStylistsErrorAction implements Action {
  readonly type = stylistsActionTypes.SEARCH_STYLISTS_ERROR;
  readonly requestState = RequestState.Failed;
  constructor(public errors: ApiError[]) {}
}

export class SearchStylistSuccessAction implements Action {
  readonly type = stylistsActionTypes.SEARCH_STYLISTS_SUCCESS;
  readonly requestState = RequestState.Succeeded;
  constructor(public stylists: StylistModel[]) {}
}

type Actions =
  | ConfirmCodeSuccessAction // save client invitation
  | SearchStylistsAction
  | SearchStylistsLoadingAction
  | SearchStylistsErrorAction
  | SearchStylistSuccessAction;

export interface StylistState {
  invitedBy?: StylistModel;

  query?: string;
  stylists?: StylistModel[];

  requestState: RequestState;
  errors?: ApiError[];
}

const initialState: StylistState = {
  invitedBy: undefined,

  query: undefined,
  stylists: undefined,

  requestState: RequestState.NotStarted,
  errors: undefined
};

export function stylistsReducer(state: StylistState = initialState, action: Actions): StylistState {
  switch (action.type) {
    case authActionTypes.CONFIRM_CODE_SUCCESS:
      return {
        ...state,
        invitedBy: action.invitedBy
      };

    case stylistsActionTypes.SEARCH_STYLISTS:
      return {
        ...state,
        query: action.query,

        // reset
        requestState: RequestState.NotStarted,
        errors: undefined
      };

    case stylistsActionTypes.SEARCH_STYLISTS_LOADING:
      return {
        ...state,
        requestState: action.requestState
      };

    case stylistsActionTypes.SEARCH_STYLISTS_ERROR:
      return {
        ...state,
        requestState: action.requestState,
        errors: action.errors
      };

    case stylistsActionTypes.SEARCH_STYLISTS_SUCCESS:
      return {
        ...state,
        requestState: action.requestState,
        stylists: action.stylists
      };

    default:
      return state;
  }
}

export const stylistsPath = 'stylists';

const selectStylistFromState = createFeatureSelector<StylistState>(stylistsPath);

export const selectInvitedByStylist = createSelector(
  selectStylistFromState,
  (state: StylistState): StylistModel | undefined => state.invitedBy
);

export const selectStylists = createSelector(
  selectStylistFromState,
  (state: StylistState): StylistModel[] | undefined => state.stylists
);
