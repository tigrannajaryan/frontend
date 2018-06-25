import { Action, createFeatureSelector } from '@ngrx/store';

import { StylistProfile } from '~/core/stylist-service/stylist-models';

export enum profileActionTypes {
  LOAD = 'PROFILE_LOAD',
  LOAD_SUCCESS = 'PROFILE_LOAD_SUCCESS',
  LOAD_ERROR = 'PROFILE_LOAD_ERROR'
}

export type ProfileState = StylistProfile | undefined;

const initialState: ProfileState = undefined;

export class LoadProfileAction implements Action {
  readonly type = profileActionTypes.LOAD;
}

export class LoadProfileSuccessAction implements Action {
  readonly type = profileActionTypes.LOAD_SUCCESS;
  constructor(public profile: StylistProfile) { }
}

export class LoadProfileErrorAction implements Action {
  readonly type = profileActionTypes.LOAD_ERROR;
  constructor(public error: Error) { }
}

type Actions =
  | LoadProfileAction
  | LoadProfileSuccessAction
  | LoadProfileErrorAction;

export function profileReducer(state: ProfileState = initialState, action: Actions): ProfileState {
  switch (action.type) {
    case profileActionTypes.LOAD_SUCCESS:
      return action.profile;

    default:
      return state;
  }
}

export const profileStatePath = 'profile';

export const selectProfile = createFeatureSelector<ProfileState>(profileStatePath);
