import { ErrorHandler, Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { saveToken } from '~/core/utils/token-utils';

import { AuthServiceMock } from '~/core/api/auth-service.mock';
import {
  AuthTokenModel,
  ConfirmCodeParams,
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
  selectConfirmCodeSucceded,
  selectPhone,
  selectRequestCodeSucceded,
  selectToken
} from '~/core/reducers/auth.reducer';
import { SetPhoneAction } from '~/core/reducers/profile.reducer';

@Injectable()
export class AuthEffects {

  @Effect() getCodeRequest = this.actions
    .ofType(authActionTypes.REQUEST_CODE)
    .switchMap((action: RequestCodeAction) => {
      const params: GetCodeParams = { phone: action.phone };
      return (
        this.authService.getCode(params)
          .map(({ response, errors }) => {
            if (errors) {
              return new RequestCodeErrorAction(errors);
            }
            return new RequestCodeSuccessAction();
          })
      );
    });

  @Effect({ dispatch: false }) getCodeLoading = this.actions
    .ofType(authActionTypes.REQUEST_CODE)
    .delay(250)
    .withLatestFrom(this.store)
    .map(([action, store]) => {
      if (!selectRequestCodeSucceded(store)) {
        this.store.dispatch(new RequestCodeLoadingAction());
      }
    });

  @Effect() confirmCodeRequest = this.actions
    .ofType(authActionTypes.CONFIRM_CODE)
    .map((action: ConfirmCodeAction) => action)
    .withLatestFrom(this.store)
    .map(([action, store]) => {
      const phone = selectPhone(store);
      return { phone, code: action.code };
    })
    .switchMap((params: ConfirmCodeParams) =>
      this.authService.confirmCode(params)
        .map(({ response, errors }) => {
          if (errors) {
            return new ConfirmCodeErrorAction(errors);
          }
          const { created_at, token } = response;
          const tokenData: AuthTokenModel = { created_at, token };
          return new ConfirmCodeSuccessAction(tokenData);
        })
    );

  @Effect({ dispatch: false }) confirmCodeLoading = this.actions
    .ofType(authActionTypes.CONFIRM_CODE)
    .delay(250)
    .withLatestFrom(this.store)
    .map(([action, store]) => {
      if (!selectConfirmCodeSucceded(store)) {
        this.store.dispatch(new ConfirmCodeLoadingAction());
      }
    });

  @Effect({ dispatch: false }) saveToken = this.actions
    .ofType(authActionTypes.CONFIRM_CODE_SUCCESS)
    .withLatestFrom(this.store)
    .switchMap(([action, store]): Observable<boolean> => {
      const token = selectToken(store);
      return Observable.from(
        saveToken(token)
          .then(() => true)
          .catch((error: Error) => {
            this.errorHandler.handleError(error);
            return false;
          })
      );
    })
    .share();

  @Effect() setProfilePhone = this.actions
    .ofType(authActionTypes.CONFIRM_CODE_SUCCESS)
    .switchMap(() => Observable.from(this.store.select(selectPhone)))
    .map((phone: string) => new SetPhoneAction(phone));

  constructor(
    private actions: Actions,
    private authService: AuthServiceMock,
    private errorHandler: ErrorHandler,
    private store: Store<AuthState>
  ) {
  }
}
