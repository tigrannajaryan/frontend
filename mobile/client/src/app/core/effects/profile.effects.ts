import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { catchError, map } from 'rxjs/operators';

import { BaseApiService } from '~/shared/base-api-service';

import { showAlert } from '~/core/utils/alert';

import { LOADING_DELAY, RequestState } from '~/core/api/request.models.ts';
import { ApiResponse } from '~/core/api/base.models';
import { ProfileModel } from '~/core/api/profile.models';
import { ProfileService } from '~/core/api/profile-service';

import {
  LoadingProfileAction,
  profileActionTypes,
  RequestGetProfileAction,
  RequestGetProfileErrorAction,
  RequestGetProfileSuccessAction,
  RequestUpdateImage,
  RequestUpdateImageError,
  RequestUpdateImageSuccess,
  RequestUpdateProfileAction,
  RequestUpdateProfileErrorAction,
  RequestUpdateProfileSuccessAction,
  selectProfile,
  selectProfileRequestState
} from '~/core/reducers/profile.reducer';

@Injectable()
export class ProfileEffects {

  @Effect() getProfile = this.actions
    .ofType<RequestGetProfileAction>(profileActionTypes.REQUEST_GET_PROFILE)
    .switchMap(() => this.profileService.getProfile())
    .map((response: ApiResponse<ProfileModel>) => {
      return response.errors ? new RequestGetProfileErrorAction(response.errors) : new RequestGetProfileSuccessAction(response.response);
    });

  @Effect({ dispatch: false }) profileLoading = this.actions
    .ofType<RequestGetProfileAction>(profileActionTypes.REQUEST_GET_PROFILE, profileActionTypes.REQUEST_UPDATE_PROFILE)
    .withLatestFrom(this.store)
    .delay(LOADING_DELAY)
    .map(([action, store]) => {
      if (selectProfileRequestState(store) === RequestState.NotStarted) {
        this.store.dispatch(new LoadingProfileAction());
      }
    });

  @Effect() updateProfile: Observable<Action> = this.actions
    .ofType<RequestUpdateProfileAction>(profileActionTypes.REQUEST_UPDATE_PROFILE)
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
      if (response.errors) {
        return new RequestUpdateProfileErrorAction(response.errors);
      }
      return new RequestUpdateProfileSuccessAction(response.response);
    });

  @Effect({ dispatch: false }) profileUpdatedSuccess: Observable<void> = this.actions
    .ofType<RequestUpdateProfileSuccessAction>(profileActionTypes.REQUEST_UPDATE_PROFILE_SUCCESS)
    .map(() => {
      showAlert('Profile updated', 'Your profile has been updated.');
    });

  // This will be removed due to displaying the errors in the form fields.
  @Effect({ dispatch: false }) profileUpdatedError: Observable<void> = this.actions
    .ofType<RequestUpdateProfileErrorAction>(profileActionTypes.REQUEST_UPDATE_PROFILE_ERROR)
    .map(() => {
      // TODO: better errors
      showAlert('Error', 'Your profile has not been updated.');
    });

  @Effect({ dispatch: false }) profileGetError: Observable<void> = this.actions
    .ofType<RequestGetProfileErrorAction>(profileActionTypes.REQUEST_GET_PROFILE_ERROR)
    .map(action => {
      // TODO: change this, smth wrong
      const errorMessage = action.errors[0]['error'];
      showAlert('Error', errorMessage);
    });

  @Effect() profileUpdateImage: Observable<Action> = this.actions
    .ofType<RequestUpdateImage>(profileActionTypes.REQUEST_UPDATE_IMAGE)
    .switchMap(action =>
      // TODO: refactor
      Observable
        .from(this.baseApiService.uploadFile<{ uuid: string }>(action.formData))
        .pipe(
          map(response => new RequestUpdateImageSuccess(response.uuid)),
          catchError(error => Observable.of(new RequestUpdateImageError(error)))
        )
    );

  constructor(
    protected actions: Actions,
    protected baseApiService: BaseApiService,
    protected profileService: ProfileService,
    protected store: Store<ProfileModel>
  ) {
  }
}
