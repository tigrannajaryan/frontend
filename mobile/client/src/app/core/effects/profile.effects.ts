import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import {
  profileActionTypes,
  RequestUpdateProfileAction,
  RequestUpdateProfileErrorAction, RequestUpdateProfileLoadingAction,
  RequestUpdateProfileSucceedAction, selectIsLoading
} from '~/core/reducers/profile.reducer';
import { Observable } from "rxjs/Observable";
import { Action, Store } from '@ngrx/store';
import { ProfileService } from "~/core/api/profile-service";
import { ProfileModel } from "~/core/api/profile.models";

@Injectable()
export class ProfileEffects {

  /**
   * Here we implement the updateProfile effect that will cal the API to update a profile.
   * @type {Observable<RequestUpdateProfileSucceedAction> | Observable<RequestUpdateProfileErrorAction>}
   */
  @Effect()
  updateProfile: Observable<Action> = this.actions
    .ofType<RequestUpdateProfileAction>(profileActionTypes.REQUEST_UPDATE_PROFILE)
    .switchMap(action => {
      return this.profileService.updateProfile(action.profile)
    })
    .map( (response) => {
      if (response.errors) {
        return new RequestUpdateProfileErrorAction(response.errors);
      }
      return new RequestUpdateProfileSucceedAction(response.response);
    });

  /**
   * Whenever an update is requested, dispatch a loading request action.
   */
  @Effect({dispatch: false})
  updateProfileLoading = this.actions
    .ofType<RequestUpdateProfileAction>(profileActionTypes.REQUEST_UPDATE_PROFILE)
    .delay(250)
    .withLatestFrom(this.store)
    .map(([action, store]) => {
      if (selectIsLoading(store)) {
        this.store.dispatch(new RequestUpdateProfileLoadingAction());
      }
    });

    constructor(
      protected actions: Actions,
      protected profileService: ProfileService,
      protected store: Store<ProfileModel>
    ) {

    }

}
