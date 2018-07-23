import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import {
  profileActionTypes,
  RequestUpdateProfileAction,
  RequestUpdateProfileSucceedAction
} from '~/core/reducers/profile.reducer';
import { ProfileServiceMock } from '~/core/api/profile-service.mock';
import { Observable } from "rxjs/Observable";
import { Action } from '@ngrx/store';

@Injectable()
export class ProfileEffects {

  /**
   * Here we implement the updateProfile effect that will cal the API to update a profile.
   * @type {Observable<RequestUpdateProfileSucceedAction>}
   */
  @Effect()
  updateProfile: Observable<Action> = this.actions$
    .ofType<RequestUpdateProfileAction>(profileActionTypes.REQUEST_UPDATE_PROFILE)
    .switchMap(action => {
      return this.profileService.updateProfile(action.profile)
    })
    .map(profile => new RequestUpdateProfileSucceedAction(profile))

    constructor(protected actions$: Actions, protected profileService: ProfileServiceMock) {

    }

}
