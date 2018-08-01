import { Action, createFeatureSelector, createSelector } from '@ngrx/store';

import { RequestState } from '~/core/api/request.models';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiError } from '~/core/api/errors.models';

export enum profileActionTypes {
  SET_PHONE = 'PROFILE_SET_PHONE',

  // Profile Get.
  REQUEST_GET_PROFILE = 'PROFILE_REQUEST',
  REQUEST_GET_PROFILE_SUCCESS = 'PROFILE_REQUEST_SUCCESS',
  REQUEST_GET_PROFILE_ERROR = 'PROFILE_REQUEST_ERROR',

  // Loading indicator.
  PROFILE_LOADING = 'PROFILE_LOADING',

  REQUEST_UPDATE_IMAGE = 'IMAGE_REQUEST',
  REQUEST_UPDATE_IMAGE_SUCCESS = 'IMAGE_REQUEST_SUCCESS',
  REQUEST_UPDATE_IMAGE_ERROR = 'IMAGE_REQUEST_ERROR',

  // Profile Post
  REQUEST_UPDATE_PROFILE = 'PROFILE_REQUEST_UPDATE',
  REQUEST_UPDATE_PROFILE_SUCCESS = 'PROFILE_REQUEST_UPDATE_SUCCESS',
  REQUEST_UPDATE_PROFILE_ERROR = 'PROFILE_REQUEST_UPDATE_ERROR'

}

export class SetPhoneAction implements Action {
  readonly type = profileActionTypes.SET_PHONE;
  constructor(public phone: string) {}
}

export class RequestGetProfileAction implements Action {
  readonly type = profileActionTypes.REQUEST_GET_PROFILE;
  readonly requestState = RequestState.NotStarted;
}

export class RequestGetProfileSuccessAction implements Action {
  readonly type = profileActionTypes.REQUEST_GET_PROFILE_SUCCESS;
  readonly requestState = RequestState.Succeeded;
  constructor(public profile: ProfileModel) {}
}

export class RequestGetProfileErrorAction implements Action {
  readonly type = profileActionTypes.REQUEST_GET_PROFILE_ERROR;
  readonly requestState = RequestState.Failed;
  constructor(public errors: ApiError[]) {}
}

export class RequestUpdateProfileAction implements Action {
  readonly type = profileActionTypes.REQUEST_UPDATE_PROFILE;
  readonly requestState = RequestState.NotStarted;
  constructor(public profile: ProfileModel) {}
}

export class LoadingProfileAction implements Action {
  readonly type = profileActionTypes.PROFILE_LOADING;
  readonly requestState = RequestState.Loading;
}

export class RequestUpdateProfileSuccessAction implements Action {
  readonly type = profileActionTypes.REQUEST_UPDATE_PROFILE_SUCCESS;
  readonly requestState = RequestState.Succeeded;
  constructor(public profile: ProfileModel) {}
}

export class RequestUpdateProfileErrorAction implements Action {
  readonly type = profileActionTypes.REQUEST_UPDATE_PROFILE_ERROR;
  readonly requestState = RequestState.Failed;
  constructor(public errors: ApiError[]) {}
}

export class RequestUpdateImage implements Action {
  readonly type = profileActionTypes.REQUEST_UPDATE_IMAGE;
  readonly requestState = RequestState.NotStarted;
  constructor(
    public localImgUrl: string,
    public formData: FormData
  ) {}
}

export class RequestUpdateImageSuccess implements Action {
  readonly type = profileActionTypes.REQUEST_UPDATE_IMAGE_SUCCESS;
  readonly requestState = RequestState.Succeeded;
  constructor(public uuid: any) {}
}

export class RequestUpdateImageError implements Action {
  readonly type = profileActionTypes.REQUEST_UPDATE_IMAGE_ERROR;
  readonly requestState = RequestState.Failed;
  constructor(public errors: ApiError[]) {}
}

type Actions =
  | SetPhoneAction
  | RequestUpdateProfileAction
  | RequestUpdateProfileErrorAction
  | LoadingProfileAction
  | RequestUpdateProfileSuccessAction
  | RequestGetProfileAction
  | RequestGetProfileSuccessAction
  | RequestGetProfileErrorAction
  | RequestUpdateImage
  | RequestUpdateImageSuccess
  | RequestUpdateImageError;

export interface ProfileState {
  profile: ProfileModel;
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

    case profileActionTypes.REQUEST_GET_PROFILE_SUCCESS:
    case profileActionTypes.REQUEST_UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        requestState: action.requestState,
        profile: {
          ...action.profile
        }
      };

    case profileActionTypes.PROFILE_LOADING:
    case profileActionTypes.REQUEST_UPDATE_PROFILE:
    case profileActionTypes.REQUEST_GET_PROFILE:
      return {
        ...state,
        requestState: action.requestState
      };

    case profileActionTypes.REQUEST_UPDATE_IMAGE:
      return {
        ...state,
        requestState: action.requestState,
        profile: {
          ...state.profile,
          profile_photo_url: action.localImgUrl
        }
      };

    case profileActionTypes.REQUEST_UPDATE_PROFILE_ERROR:
    case profileActionTypes.REQUEST_GET_PROFILE_ERROR:
    case profileActionTypes.REQUEST_UPDATE_IMAGE_ERROR:
      return {
        ...state,
        requestState: action.requestState,
        errors: action.errors
      };

    case profileActionTypes.REQUEST_UPDATE_IMAGE_SUCCESS:
      return {
        ...state,
        requestState: action.requestState,
        profile: {
          ...state.profile,
          profile_photo_id: action.uuid
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
  selectProfileRequestState,
  (requestState: RequestState) => requestState === RequestState.Loading
);
