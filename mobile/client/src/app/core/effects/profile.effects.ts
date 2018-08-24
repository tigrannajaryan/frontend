import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';

import { LOADING_DELAY, RequestState } from '~/core/api/request.models.ts';
import { ApiResponse } from '~/core/api/base.models';
import { ProfileModel } from '~/core/api/profile.models';
import { ProfileApi } from '~/core/api/profile-api';

import {
  GetProfileAction,
  GetProfileErrorAction,
  GetProfileSuccessAction,
  LoadingProfileAction,
  profileActionTypes,
  selectProfile,
  selectProfileRequestState,
  UpdateImage,
  UpdateImageError,
  UpdateImageSuccess,
  UpdateProfileAction,
  UpdateProfileErrorAction,
  UpdateProfileSuccessAction
} from '~/core/reducers/profile.reducer';
import { BaseService } from '~/core/api/base-service';

@Injectable()
export class ProfileEffects {

  @Effect() getProfile = this.actions
    .ofType<GetProfileAction>(profileActionTypes.GET_PROFILE)
    .switchMap(() => this.profileService.getProfile())
    .map((response: ApiResponse<ProfileModel>) => {
      return response.error ? new GetProfileErrorAction(response.error) : new GetProfileSuccessAction(response.response);
    });

  @Effect({ dispatch: false }) profileLoading = this.actions
    .ofType<GetProfileAction>(profileActionTypes.GET_PROFILE, profileActionTypes.UPDATE_PROFILE)
    .withLatestFrom(this.store)
    .delay(LOADING_DELAY)
    .map(([action, store]) => {
      if (selectProfileRequestState(store) === RequestState.NotStarted) {
        this.store.dispatch(new LoadingProfileAction());
      }
    });

  @Effect() updateProfile: Observable<Action> = this.actions
    .ofType<UpdateProfileAction>(profileActionTypes.UPDATE_PROFILE)
    .withLatestFrom(this.store)
    .switchMap(([action, state]) => {
      const { profile_photo_id } = selectProfile(state);
      const profile = {
        profile_photo_id,
        ...action.profile
      };
      return this.profileService.updateProfile(profile);
    })
    .map(response => {
      if (response.error) {
        return new UpdateProfileErrorAction(response.error);
      }
      return new UpdateProfileSuccessAction(response.response);
    });

  @Effect() profileUpdateImage: Observable<Action> = this.actions
    .ofType<UpdateImage>(profileActionTypes.UPDATE_IMAGE)
    .switchMap(action =>
      Observable
        .from(this.baseService.uploadFile<{ uuid: string }>(action.formData))
        .pipe(
          map(response => new UpdateImageSuccess(response.uuid)),
          catchError(error => Observable.of(new UpdateImageError(error)))
        )
    );

  constructor(
    protected actions: Actions,
    protected baseService: BaseService,
    protected profileService: ProfileApi,
    protected store: Store<ProfileModel>
  ) {
  }
}
