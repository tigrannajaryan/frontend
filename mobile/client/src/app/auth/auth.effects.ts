import { ErrorHandler, Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { NonFieldErrorItem } from '~/shared/api-errors';
import { hasError } from '~/shared/pipes/has-error.pipe';
import { saveToken } from '~/core/utils/token-utils';
import { LOADING_DELAY, RequestState } from '~/core/api/request.models';
import { AuthService } from '~/auth/auth.api';
import {
  AuthTokenModel,
  ConfirmCodeParams,
  GetCodeParams
} from '~/auth/auth.models';
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
  selectConfirmCodeState,
  selectRequestCodeState
} from '~/auth/auth.reducer';

@Injectable()
export class AuthEffects {

  @Effect() getCodeRequest = this.actions
    .ofType(authActionTypes.REQUEST_CODE)
    .map((action: RequestCodeAction) => ({ phone: action.phone }))
    .switchMap((params: GetCodeParams) =>
      this.authService.getCode(params, { hideGenericAlertOnFieldAndNonFieldErrors: true })
        .map(({ response, error }) => {
          const timestamp = Number(new Date());
          if (error) {
            const requestCodeTimeoutError = new NonFieldErrorItem({ code: 'err_wait_to_rerequest_new_code' });
            if (hasError(error, requestCodeTimeoutError)) {
              // code already sent, consider it as success for simplicity
              return new RequestCodeSuccessAction();
            }
            return new RequestCodeErrorAction(error);
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

      this.authService.confirmCode(params, { hideGenericAlertOnFieldAndNonFieldErrors: true })
        .map(({ response, error }) => {
          if (error) {
            return new ConfirmCodeErrorAction(error);
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

  constructor(
    private actions: Actions,
    private authService: AuthService,
    private errorHandler: ErrorHandler,
    private store: Store<AuthState>
  ) {
  }
}
