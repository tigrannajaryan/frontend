import { ErrorHandler, Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { saveToken } from '~/core/utils/token-utils';
import { hasError } from '~/core/pipes/has-error.pipe';

import { LOADING_DELAY } from '~/core/api/request.models';
import { ApiNonFieldError, AuthNonFieldErrorCodes } from '~/core/api/errors.models';
import { AuthService } from '~/core/api/auth-service';
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
  selectConfirmCodeSucceeded,
  selectPhone,
  selectRequestCodeSucceeded,
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
            const timestamp = Number(new Date());
            if (errors) {
              const requestCodeTimeoutError = new ApiNonFieldError({ code: AuthNonFieldErrorCodes.err_wait_to_rerequest_new_code });
              if (hasError(errors, requestCodeTimeoutError)) {
                // code already sent, consider it as success for simplicity
                return new RequestCodeSuccessAction();
              }
              return new RequestCodeErrorAction(errors);
            }
            return new RequestCodeSuccessAction(timestamp);
          })
      );
    });

  @Effect({ dispatch: false }) getCodeLoading = this.actions
    .ofType(authActionTypes.REQUEST_CODE)
    .delay(LOADING_DELAY)
    .withLatestFrom(this.store)
    .map(([action, state]) => {
      if (!selectRequestCodeSucceeded(state)) {
        this.store.dispatch(new RequestCodeLoadingAction());
      }
    });

  @Effect() confirmCodeRequest = this.actions
    .ofType(authActionTypes.CONFIRM_CODE)
    .map((action: ConfirmCodeAction) => action)
    .withLatestFrom(this.store)
    .map(([action, state]) => {
      const phone = selectPhone(state);
      return { phone, code: action.code };
    })
    .switchMap((params: ConfirmCodeParams) =>
      this.authService.confirmCode(params)
        .map(({ response, errors }) => {
          if (errors) {
            return new ConfirmCodeErrorAction(errors);
          }
          const { created_at, token, stylist_invitation } = response;
          const tokenData: AuthTokenModel = { created_at, token };
          return new ConfirmCodeSuccessAction(tokenData, stylist_invitation);
        })
    );

  @Effect({ dispatch: false }) confirmCodeLoading = this.actions
    .ofType(authActionTypes.CONFIRM_CODE)
    .delay(LOADING_DELAY)
    .withLatestFrom(this.store)
    .map(([action, state]) => {
      if (!selectConfirmCodeSucceeded(state)) {
        this.store.dispatch(new ConfirmCodeLoadingAction());
      }
    });

  @Effect({ dispatch: false }) saveToken = this.actions
    .ofType(authActionTypes.CONFIRM_CODE_SUCCESS)
    .withLatestFrom(this.store)
    .switchMap(([action, state]): Observable<boolean> => {
      const token = selectToken(state);
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
    private authService: AuthService,
    private errorHandler: ErrorHandler,
    private store: Store<AuthState>
  ) {
  }
}
