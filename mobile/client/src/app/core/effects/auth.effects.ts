import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PageNames } from '~/core/page-names';
import { saveToken } from '~/core/utils/token-utils';

import { AuthServiceMock } from '~/core/api/auth-service.mock';
import {
  AuthTokenModel,
  ConfirmCodeParams,
  ConfirmCodeResponse,
  GetCodeParams
} from '~/core/api/auth.models';
import {
  authActionTypes,
  AuthState,
  ConfirmCodeAction,
  ConfirmCodeErrorAction,
  ConfirmCodeLoadingAction,
  ConfirmCodeSuccessAction,
  RequestCodeAction,
  RequestCodeErrorAction,
  RequestCodeLoadingAction,
  RequestCodeSuccessAction,
  selectPhone,
  selectToken
} from '~/core/reducers/auth.reducer';
import { UnhandledErrorAction } from '~/core/reducers/errors.reducer';
import { SetPhoneAction } from '~/core/reducers/profile.reducer';

@Injectable()
export class AuthEffects {

  @Effect() getCodeLoading = this.actions
    .ofType(authActionTypes.REQUEST_CODE)
    .map(() => new RequestCodeLoadingAction());

  @Effect() getCodeRequest = this.actions
    .ofType(authActionTypes.REQUEST_CODE)
    .switchMap((action: RequestCodeAction) => {
      const params: GetCodeParams = { phone: action.phone };
      return (
        this.authService.getCode(params)
          .map(() => new RequestCodeSuccessAction())
          .catch((error: Error) => Observable.of(new RequestCodeErrorAction(error)))
      );
    });

  @Effect() confirmCodeLoading = this.actions
    .ofType(authActionTypes.CONFIRM_CODE)
    .map(() => new ConfirmCodeLoadingAction());

  @Effect() confirmCodeRequest = this.actions
    .ofType(authActionTypes.CONFIRM_CODE)
    .combineLatest(
      this.store.select(selectPhone)
    )
    .map((data: [ConfirmCodeAction, string]) => {
      const [ action, phone ] = data;
      return { phone, code: action.code };
    })
    .switchMap((params: ConfirmCodeParams) =>
      this.authService.confirmCode(params)
        .map((response: ConfirmCodeResponse) => {
          const { created_at, token } = response;
          const tokenData: AuthTokenModel = { created_at, token };
          return new ConfirmCodeSuccessAction(tokenData);
        })
        .catch((error: Error) => Observable.of(new ConfirmCodeErrorAction(error)))
    );

  @Effect({ dispatch: false }) saveToken = this.actions
    .ofType(authActionTypes.CONFIRM_CODE_SUCCESS)
    .switchMap((): Observable<AuthTokenModel> => Observable.from(this.store.select(selectToken)))
    .switchMap((token: AuthTokenModel): Observable<boolean> => Observable.from(
      saveToken(token)
        .then(() => true)
        .catch((error: Error) => {
          this.store.dispatch(new UnhandledErrorAction(error));
          return false;
        })
    ))
    .share();

  @Effect() setProfilePhone = this.actions
    .ofType(authActionTypes.CONFIRM_CODE_SUCCESS)
    .switchMap(() => Observable.from(this.store.select(selectPhone)))
    .map((phone: string) => new SetPhoneAction(phone));

  constructor(
    private actions: Actions,
    private authService: AuthServiceMock,
    private store: Store<AuthState>
  ) {
  }
}
