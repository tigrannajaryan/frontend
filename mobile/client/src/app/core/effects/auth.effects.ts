import { ErrorHandler, Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { saveToken } from '~/core/utils/token-utils';
import { hasError } from '~/core/pipes/has-error.pipe';

import { LOADING_DELAY, RequestState } from '~/core/api/request.models';
import { ApiNonFieldError } from '~/core/api/errors.models';
import { AuthService } from '~/core/api/auth-service';
import {
  AuthTokenModel,
  ConfirmCodeParams,
  GetCodeParams
} from '~/core/api/auth.models';
import {
  authActionTypes,
  AuthState,
  ClearSendCodeTimeout,
  ConfirmCodeAction,
  ConfirmCodeErrorAction,
  ConfirmCodeLoadingAction,
  ConfirmCodeSuccessAction,
  RequestCodeAction,
  RequestCodeErrorAction,
  RequestCodeLoadingAction,
  RequestCodeSuccessAction,
  selectCanRequestCode,
  selectCanRequestCodeInSeconds,
  selectConfirmCodeState,
  selectRequestCodeState
} from '~/core/reducers/auth.reducer';
import { SetPhoneAction } from '~/core/reducers/profile.reducer';

@Injectable()
export class AuthEffects {

  @Effect() getCodeRequest = this.actions
    .ofType(authActionTypes.REQUEST_CODE)
    .map((action: RequestCodeAction) => ({ phone: action.phone }))
    .switchMap((params: GetCodeParams) =>
      this.authService.getCode(params)
        .map(({ response, errors }) => {
          const timestamp = Number(new Date());
          if (errors) {
            const requestCodeTimeoutError = new ApiNonFieldError({ code: 'err_wait_to_rerequest_new_code' });
            if (hasError(errors, requestCodeTimeoutError)) {
              // code already sent, consider it as success for simplicity
              return new RequestCodeSuccessAction();
            }
            return new RequestCodeErrorAction(errors);
          }
          return new RequestCodeSuccessAction(timestamp);
        })
    )
    .share();

  @Effect({ dispatch: false }) getCodeLoading = this.actions
    .ofType(authActionTypes.REQUEST_CODE)
    .delay(LOADING_DELAY)
    .withLatestFrom(this.store)
    .map(([action, state]) => {
      if (selectRequestCodeState(state) === RequestState.NotStarted) {
        this.store.dispatch(new RequestCodeLoadingAction());
        return true;
      }
      return false;
    })
    .share();

  @Effect() confirmCodeRequest = this.actions
    .ofType(authActionTypes.CONFIRM_CODE)
    .map((action: ConfirmCodeAction) => ({ phone: action.phone, code: action.code }))
    .switchMap((params: ConfirmCodeParams) =>
      this.authService.confirmCode(params)
        .map(({ response, errors }) => {
          if (errors) {
            return new ConfirmCodeErrorAction(errors);
          }
          const { created_at, token, stylist_invitation } = response;
          const tokenData: AuthTokenModel = { created_at, token };
          // TODO: replace stylist_invitation[0] with the latest invitation retrieved from the array (when it would be done on the backend)
          return new ConfirmCodeSuccessAction(params.phone, tokenData, stylist_invitation[0]);
        })
    );

  @Effect({ dispatch: false }) confirmCodeLoading = this.actions
    .ofType(authActionTypes.CONFIRM_CODE)
    .delay(LOADING_DELAY)
    .withLatestFrom(this.store)
    .map(([action, state]) => {
      if (selectConfirmCodeState(state) === RequestState.NotStarted) {
        this.store.dispatch(new ConfirmCodeLoadingAction());
      }
    });

  @Effect({ dispatch: false }) saveToken = this.actions
    .ofType(authActionTypes.CONFIRM_CODE_SUCCESS)
    .switchMap((action: ConfirmCodeSuccessAction): Observable<boolean> =>
      Observable.from(
        saveToken(action.token)
          .then(() => true)
          .catch((error: Error) => {
            this.errorHandler.handleError(error);
            return false;
          })
      )
    )
    .share();

  @Effect({ dispatch: false }) codeResendCountdown = this.actions
    .ofType(authActionTypes.REQUEST_CODE_SUCCESS)
    .map((action: RequestCodeSuccessAction) => action)
    .withLatestFrom(this.store)
    .map(([action, state]) => selectCanRequestCodeInSeconds()(state))
    .switchMap((seconds: number) => {
      if (seconds === 0) {
        this.store.dispatch(new ClearSendCodeTimeout());
        return Observable.of(0);
      }
      return (
        Observable
          .timer(0, 1000)
          .withLatestFrom(this.store)
          .takeWhile(([i, updatedState]) => {
            const canRequestCode = selectCanRequestCode()(updatedState);
            if (canRequestCode) {
              this.store.dispatch(new ClearSendCodeTimeout());
            }
            return !canRequestCode;
          })
          .map(([i, updatedState]) => {
            const remaining = seconds - i;
            return remaining > 0 ? remaining : 0;
          })
      );
    })
    .share();

  @Effect() setProfilePhone = this.actions
    .ofType(authActionTypes.CONFIRM_CODE_SUCCESS)
    .map((action: ConfirmCodeSuccessAction) => new SetPhoneAction(action.phone));

  constructor(
    private actions: Actions,
    private authService: AuthService,
    private errorHandler: ErrorHandler,
    private store: Store<AuthState>
  ) {
  }
}
