import { Action, createFeatureSelector, createSelector } from '@ngrx/store';

import { RequestState } from '~/core/api/request.models';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiError } from '~/core/api/errors.models';

export enum profileActionTypes {
  SET_PHONE = 'PROFILE_SET_PHONE',

  // Profile Get.
  GET_PROFILE = 'PROFILE_REQUEST',
  GET_PROFILE_SUCCESS = 'PROFILE_SUCCESS',
  GET_PROFILE_ERROR = 'PROFILE_ERROR',

  // Loading indicator.
  PROFILE_LOADING = 'PROFILE_LOADING',

  UPDATE_IMAGE = 'IMAGE_REQUEST',
  UPDATE_IMAGE_SUCCESS = 'IMAGE_SUCCESS',
  UPDATE_IMAGE_ERROR = 'IMAGE_ERROR',

  // Profile Post
  UPDATE_PROFILE = 'PROFILE_UPDATE',
  UPDATE_PROFILE_SUCCESS = 'PROFILE_UPDATE_SUCCESS',
  UPDATE_PROFILE_ERROR = 'PROFILE_UPDATE_ERROR'
}

export enum ProfileRequestType {
  GetProfile = 'GetProfile',
  UpdateProfile = 'UpdateProfile'
}

export class SetPhoneAction implements Action {
  readonly type = profileActionTypes.SET_PHONE;
  constructor(public phone: string) {}
}

export class GetProfileAction implements Action {
  readonly type = profileActionTypes.GET_PROFILE;
}

export class GetProfileSuccessAction implements Action {
  readonly type = profileActionTypes.GET_PROFILE_SUCCESS;
  constructor(public profile: ProfileModel) {}
}

export class GetProfileErrorAction implements Action {
  readonly type = profileActionTypes.GET_PROFILE_ERROR;
  constructor(public errors: ApiError[]) {}
}

export class UpdateProfileAction implements Action {
  readonly type = profileActionTypes.UPDATE_PROFILE;
  constructor(public profile: ProfileModel) {}
}

export class LoadingProfileAction implements Action {
  readonly type = profileActionTypes.PROFILE_LOADING;
}

export class UpdateProfileSuccessAction implements Action {
  readonly type = profileActionTypes.UPDATE_PROFILE_SUCCESS;
  constructor(public profile: ProfileModel) {}
}

export class UpdateProfileErrorAction implements Action {
  readonly type = profileActionTypes.UPDATE_PROFILE_ERROR;
  constructor(public errors: ApiError[]) {}
}

export class UpdateImage implements Action {
  readonly type = profileActionTypes.UPDATE_IMAGE;
  constructor(
    public localImgUrl: string,
    public formData: FormData
  ) {}
}

export class UpdateImageSuccess implements Action {
  readonly type = profileActionTypes.UPDATE_IMAGE_SUCCESS;
  constructor(public uuid: any) {}
}

export class UpdateImageError implements Action {
  readonly type = profileActionTypes.UPDATE_IMAGE_ERROR;
  constructor(public errors: ApiError[]) {}
}

type Actions =
  | SetPhoneAction
  | UpdateProfileAction
  | UpdateProfileErrorAction
  | LoadingProfileAction
  | UpdateProfileSuccessAction
  | GetProfileAction
  | GetProfileSuccessAction
  | GetProfileErrorAction
  | UpdateImage
  | UpdateImageSuccess
  | UpdateImageError;

export interface ProfileState {
  profile: ProfileModel;
  requestType: ProfileRequestType;
  requestState: RequestState;
  imageToUpload?: FormData;
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

    case profileActionTypes.UPDATE_PROFILE:
      return {
        ...state,
        requestType: ProfileRequestType.UpdateProfile,
        requestState: RequestState.NotStarted
      };

    case profileActionTypes.GET_PROFILE:
      return {
        ...state,
        requestType: ProfileRequestType.GetProfile,
        requestState: RequestState.NotStarted
      };

    case profileActionTypes.UPDATE_IMAGE:
      return {
        ...state,
        profile: {
          ...state.profile,
          profile_photo_url: action.localImgUrl
        },
        requestState: RequestState.NotStarted
      };

    case profileActionTypes.PROFILE_LOADING:
      return {
        ...state,
        requestState: RequestState.Loading
      };

    case profileActionTypes.UPDATE_PROFILE_ERROR:
    case profileActionTypes.GET_PROFILE_ERROR:
    case profileActionTypes.UPDATE_IMAGE_ERROR:
      return {
        ...state,
        requestState: RequestState.Failed,
        errors: action.errors
      };

    case profileActionTypes.GET_PROFILE_SUCCESS:
    case profileActionTypes.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        profile: {
          ...action.profile
        },
        requestState: RequestState.Succeeded
      };

    case profileActionTypes.UPDATE_IMAGE_SUCCESS:
      return {
        ...state,
        profile: {
          ...state.profile,
          profile_photo_id: action.uuid
        },
        requestState: RequestState.Succeeded
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

export const selectProfileErrors = createSelector(
  selectProfileFromState,
  (state: ProfileState): ApiError[] | undefined => state.errors
);

export const selectProfileRequestState = createSelector(
  selectProfileFromState,
  (state: ProfileState): RequestState => state.requestState
);

export const selectIsLoading = createSelector(
  selectProfileFromState,
  (state: ProfileState) =>
    state.requestState === RequestState.Loading && state.requestType

);
