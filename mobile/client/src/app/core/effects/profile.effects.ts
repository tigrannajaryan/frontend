import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import {
  LoadingProfileAction,
  profileActionTypes,
  RequestGetProfileAction,
  RequestGetProfileErrorAction,
  RequestGetProfileSuccessAction, RequestUpdateImage, RequestUpdateImageError, RequestUpdateImageSuccess,
  RequestUpdateProfileAction,
  RequestUpdateProfileErrorAction,
  RequestUpdateProfileSuccessAction, selectProfile,
  selectRequestSucceeded
} from '~/core/reducers/profile.reducer';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { ProfileService } from '~/core/api/profile-service';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiResponse } from '~/core/api/base.models';
import { showAlert } from '~/core/utils/alert';
import { BaseApiService } from '~/shared/base-api-service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Injectable()
export class ProfileEffects {

  /**
   * Here we implement the updateProfile effect that will cal the API to update a profile.
   */
  @Effect()
  updateProfile: Observable<Action> = this.actions
    .ofType<RequestUpdateProfileAction>(profileActionTypes.REQUEST_UPDATE_PROFILE)
    .switchMap(action => {
      return this.profileService.updateProfile(action.profile);
    })
    .map(response => {
      if (response.errors) {
        return new RequestUpdateProfileErrorAction(response.errors);
      }
      return new RequestUpdateProfileSuccessAction(response.response);
    });

  /**
   * Whenever an update/get is requested, dispatch a loading request action.
   */
  @Effect({dispatch: false})
  profileLoading = this.actions
    .ofType<RequestGetProfileAction>(profileActionTypes.REQUEST_GET_PROFILE, profileActionTypes.REQUEST_UPDATE_PROFILE)
    .withLatestFrom(this.store)
    .delay(250)
    .map(([action, store]) => {
      if (!selectRequestSucceeded(store)) {
        this.store.dispatch(new LoadingProfileAction());
      }
    });

  @Effect()
  getProfile = this.actions
    .ofType<RequestGetProfileAction>(profileActionTypes.REQUEST_GET_PROFILE)
    .switchMap(() => this.profileService.getProfile())
    .map((response: ApiResponse<ProfileModel>) => {
      return response.errors ? new RequestGetProfileErrorAction(response.errors) : new RequestGetProfileSuccessAction(response.response);
    });

  @Effect({dispatch: false})
  profileUpdatedSuccess: Observable<void> = this.actions
    .ofType<RequestUpdateProfileSuccessAction>(profileActionTypes.REQUEST_UPDATE_PROFILE_SUCCESS)
    .withLatestFrom(this.store)
    .map(() => {
      showAlert('Profile updated.', 'Your profile has been updated.');
    });

  // This will be removed due to displaying the errors in the form fields.
  @Effect({dispatch: false})
  profileUpdatedError: Observable<void> = this.actions
    .ofType<RequestUpdateProfileErrorAction>(profileActionTypes.REQUEST_UPDATE_PROFILE_ERROR)
    .withLatestFrom(this.store)
    .map(() => {
      showAlert('Error.', 'Your profile has not been updated.');
    });

  @Effect({dispatch: false})
  profileGetError: Observable<void> = this.actions
    .ofType<RequestGetProfileErrorAction>(profileActionTypes.REQUEST_GET_PROFILE_ERROR)
    .withLatestFrom(this.store)
    .map(([action, store]) => {
      const errorMessage = action.errors[0]['error'];
      showAlert('Error.', errorMessage);
    });

  @Effect()
  profileUpdateImage: Observable<Action> = this.actions
    .ofType<RequestUpdateImage>(profileActionTypes.REQUEST_UPDATE_IMAGE)
    .switchMap(action => {
      return Observable.from(this.baseApiService.uploadFile(action.formData))
        .pipe(
          map(response => new RequestUpdateImageSuccess(response)),
          catchError(error => of(new RequestUpdateImageError(error)))
        );
    });

  /**
   * After a profile image has been submitted, trigger an update profile with the current image uuid.
   */
  @Effect({dispatch: false})
  profileUpdateImageSuccess: Observable<void> = this.actions
    .ofType<RequestUpdateImageSuccess>(profileActionTypes.REQUEST_UPDATE_IMAGE_SUCCESS)
    .withLatestFrom(this.store)
    .map(([action, store]) => {
      const profile = selectProfile(store);
      this.store.dispatch(new RequestUpdateProfileAction(profile));
    });

  constructor(
    protected actions: Actions,
    protected profileService: ProfileService,
    protected baseApiService: BaseApiService,
    protected store: Store<ProfileModel>
  ) {

  }

}
