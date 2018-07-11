import { createFeatureSelector, createSelector } from '@ngrx/store';

import { RequestState } from '~/core/api/request.models';
import { ProfileModel } from '~/core/api/profile.models';

export enum profileActionTypes {
  SET_PHONE = 'PROFILE_SET_PHONE'
}

export class SetPhoneAction {
  readonly type = profileActionTypes.SET_PHONE;
  constructor(public phone: string) {}
}

type Actions =
  | SetPhoneAction;

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
