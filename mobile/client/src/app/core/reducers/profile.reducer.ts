import {Action, createFeatureSelector, createSelector} from '@ngrx/store';

import { RequestState } from '~/core/api/request.models';
import { ProfileModel } from '~/core/api/profile.models';

export enum profileActionTypes {
  SET_PHONE = 'PROFILE_SET_PHONE',
  REQUEST_UPDATE_PROFILE = 'REQUEST_UPDATE_PROFILE',
  REQUEST_UPDATE_PROFILE_SUCCEED = 'REQUEST_UPDATE_PROFILE_SUCCEED',
  REQUESTS_UPDATE_PROFILE_ERROR = 'REQUESTS_UPDATE_PROFILE_ERROR'
}

export class SetPhoneAction implements Action {
  readonly type = profileActionTypes.SET_PHONE;
  constructor(public phone: string) {}
}

export class RequestUpdateProfileAction implements Action{
  readonly type = profileActionTypes.REQUEST_UPDATE_PROFILE;
  readonly requestState = RequestState.Loading;
  constructor(public profile: ProfileModel) {}
}

export class RequestUpdateProfileSucceedAction implements Action{
  readonly type = profileActionTypes.REQUEST_UPDATE_PROFILE_SUCCEED;
  readonly requestState = RequestState.Succeded;
  constructor(public profile: ProfileModel) {}
}

export class RequestUpdateProfileErrorAction implements Action{
  readonly type = profileActionTypes.REQUESTS_UPDATE_PROFILE_ERROR;
  readonly requestState = RequestState.Failed;
  constructor(public error: any) {}
}

type Actions =
  | SetPhoneAction
  | RequestUpdateProfileAction
  | RequestUpdateProfileSucceedAction
  | RequestUpdateProfileErrorAction;

export interface ProfileState {
  profile: ProfileModel;

  requestState: RequestState;
  error?: Error;
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
    case profileActionTypes.REQUEST_UPDATE_PROFILE:
      return {
        ...state,
        profile: action.profile
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
