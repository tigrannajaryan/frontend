import { Action, createFeatureSelector, createSelector } from '@ngrx/store';

import { ApiError } from '~/shared/api-errors';
import { RequestState } from '~/core/api/request.models';
import { StylistModel } from '~/core/api/stylists.models';
import { authActionTypes, ConfirmCodeSuccessAction } from '~/auth/auth.reducer';

export enum stylistsActionTypes {
  SEARCH_STYLISTS = 'STYLISTS_SEARCH_STYLISTS',
  SEARCH_STYLISTS_ERROR = 'STYLISTS_SEARCH_STYLISTS_ERROR',
  SEARCH_STYLISTS_SUCCESS = 'STYLISTS_SEARCH_STYLISTS_SUCCESS'
}

export class SearchStylistsAction implements Action {
  readonly type = stylistsActionTypes.SEARCH_STYLISTS;
  constructor(public query?: string) {}
}

export class SearchStylistsErrorAction implements Action {
  readonly type = stylistsActionTypes.SEARCH_STYLISTS_ERROR;
  constructor(public error: ApiError) {}
}

export class SearchStylistSuccessAction implements Action {
  readonly type = stylistsActionTypes.SEARCH_STYLISTS_SUCCESS;
  constructor(public stylists: StylistModel[]) {}
}

type Actions =
  | ConfirmCodeSuccessAction // save client invitation
  | SearchStylistsAction
  | SearchStylistsErrorAction
  | SearchStylistSuccessAction;

export interface StylistState {
  invitedBy?: StylistModel;
  invitationAccepted?: boolean;

  stylists?: StylistModel[];

  requestState: RequestState;
  error?: ApiError;
}

const initialState: StylistState = {
  requestState: RequestState.NotStarted
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
        requestState: RequestState.Loading,
        error: undefined
      };

    case stylistsActionTypes.SEARCH_STYLISTS_ERROR:
      return {
        ...state,
        requestState: RequestState.Failed,
        error: action.error
      };

    case stylistsActionTypes.SEARCH_STYLISTS_SUCCESS:
      return {
        ...state,
        requestState: RequestState.Succeeded,
        stylists: action.stylists
      };

    default:
      return state;
  }
}

export const stylistsPath = 'stylists';

const selectStylistFromState = createFeatureSelector<StylistState>(stylistsPath);

export const selectStylistsRequestState = createSelector(
  selectStylistFromState,
  (state: StylistState): RequestState => state.requestState
);

export const selectInvitedByStylist = createSelector(
  selectStylistFromState,
  (state: StylistState): StylistModel | undefined => state.invitedBy
);

export const selectStylists = createSelector(
  selectStylistFromState,
  (state: StylistState): StylistModel[] | undefined => state.stylists
);
