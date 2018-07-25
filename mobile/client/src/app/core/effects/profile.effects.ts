import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import {
  LoadingProfileAction,
  profileActionTypes,
  RequestGetProfileAction,
  RequestGetProfileErrorAction,
  RequestGetProfileSuccessAction,
  RequestUpdateProfileAction,
  RequestUpdateProfileErrorAction,
  RequestUpdateProfileSuccessAction,
  selectRequestSucceeded
} from '~/core/reducers/profile.reducer';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { ProfileService } from '~/core/api/profile-service';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiResponse } from '~/core/api/base.models';

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

  constructor(
    protected actions: Actions,
    protected profileService: ProfileService,
    protected store: Store<ProfileModel>
  ) {

  }

}
