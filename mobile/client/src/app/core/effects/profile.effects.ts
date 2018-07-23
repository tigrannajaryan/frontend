import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {
  profileActionTypes,
  RequestUpdateProfileAction,
  RequestUpdateProfileSucceedAction
} from '~/core/reducers/profile.reducer';
import {ProfileServiceMock} from '~/core/api/profile-service.mock';
import {map} from 'rxjs/operators';
import {Observable} from "rxjs/Observable";
import {Action} from '@ngrx/store';
import {mergeMap} from "rxjs/operator/mergeMap";

@Injectable()
export class ProfileEffects {

  constructor(protected actions$: Actions, protected profileService: ProfileServiceMock) {

  }

  /**
   * Here we implement the updateProfile effect that will cal the API to update a profile.
   * @type {Observable<RequestUpdateProfileSucceedAction>}
   */
  @Effect()
  updateProfile: Observable<Action> = this.actions$
    .pipe(
      ofType<RequestUpdateProfileAction>(profileActionTypes.REQUEST_UPDATE_PROFILE),
      mergeMap(action => this.profileService.getProfile(action.profile)),
      map(profile => new RequestUpdateProfileSucceedAction(profile))
    );

}
