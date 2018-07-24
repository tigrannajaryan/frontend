import { Action, createFeatureSelector, createSelector } from '@ngrx/store';

import { RequestState } from '~/core/api/request.models';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiError } from "~/core/api/errors.models";

export enum profileActionTypes {
  SET_PHONE = 'PROFILE_SET_PHONE',

  REQUEST_UPDATE_PROFILE = 'PROFILE_REQUEST_UPDATE',
  REQUEST_UPDATE_PROFILE_LOADING=  'PROFILE_REQUEST_UPDATE_LOADING',
  REQUEST_UPDATE_PROFILE_SUCCESS = 'PROFILE_REQUEST_UPDATE_SUCCESS',
  REQUEST_UPDATE_PROFILE_ERROR = 'PROFILE_REQUEST_UPDATE_ERROR'

}

export class SetPhoneAction implements Action {
  readonly type = profileActionTypes.SET_PHONE;
  constructor(public phone: string) {}
}

export class RequestUpdateProfileAction implements Action{
  readonly type = profileActionTypes.REQUEST_UPDATE_PROFILE;
  readonly requestState = RequestState.NotStarted;
  constructor(public profile: ProfileModel) {}
}

export class RequestUpdateProfileLoadingAction implements Action {
  readonly type = profileActionTypes.REQUEST_UPDATE_PROFILE_LOADING;
  readonly requestState = RequestState.Loading;
  constructor() {}
}

export class RequestUpdateProfileSucceedAction implements Action{
  readonly type = profileActionTypes.REQUEST_UPDATE_PROFILE_SUCCESS;
  readonly requestState = RequestState.Succeded;
  constructor(public profile: ProfileModel) {}
}

export class RequestUpdateProfileErrorAction implements Action{
  readonly type = profileActionTypes.REQUEST_UPDATE_PROFILE_ERROR;
  readonly requestState = RequestState.Failed;
  constructor(public errors: ApiError[]) {}
}

type Actions =
  | SetPhoneAction
  | RequestUpdateProfileAction
  | RequestUpdateProfileSucceedAction
  | RequestUpdateProfileErrorAction
  | RequestUpdateProfileLoadingAction;

export interface ProfileState {
  profile: ProfileModel;
  requestState: RequestState;
  errors?: ApiError[];
}

const initialState: ProfileState = {
  profile: {
    phone: ''
  },
  requestState: RequestState.NotStarted
};

export function profileReducer(state: ProfileState = initialState, action: Actions): ProfileState {
  switch (action.type) {
    case profileActionTypes.SET_PHONE:
      return {
        ...state,
        profile: {
          ...state.profile,
          phone: action.phone
        }
      };
    case profileActionTypes.REQUEST_UPDATE_PROFILE_LOADING:
    case profileActionTypes.REQUEST_UPDATE_PROFILE:
      return {
        ...state,
        requestState: action.requestState
      };
    case profileActionTypes.REQUEST_UPDATE_PROFILE_ERROR:
      return {
        ...state,
        requestState: action.requestState,
        errors: action.errors
      };
    default:
      return state;
  }
}

export const profilePath = 'profile';

const selectProfileFromState = createFeatureSelector<ProfileState>(profilePath);

export const selectPhone = createSelector(
  selectProfileFromState,
  (state: ProfileState): string => state.profile.phone
);

export const selectProfile = createSelector(
  selectProfileFromState,
  (state: ProfileState): ProfileModel => state.profile
);

export const selectIsLoading = createSelector(
  selectProfileFromState,
  (state: ProfileState) => state.requestState == RequestState.Loading
);
