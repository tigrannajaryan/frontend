import { ErrorHandler, Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { NonFieldErrorItem } from '~/shared/api-errors';
import { hasError } from '~/shared/pipes/has-error.pipe';
import { LOADING_DELAY, RequestState } from '~/shared/api/request.models';
import { AuthService } from '~/shared/api/auth.api';
import {
  AuthTokenModel,
  ConfirmCodeParams,
  GetCodeParams
} from '~/shared/api/auth.models';
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
} from '~/shared/storage/auth.reducer';

import { saveToken } from '~/shared/storage/token-utils';
import { AppStorage } from '~/shared/storage/app-storage';

import { AppModule } from '~/app.module';

import config from '~/auth/config.json';

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
          const {
            created_at,
            token,
            stylist_invitation,
            profile_status,
            profile
          } = response;
          const tokenData: AuthTokenModel = { created_at, token };
          // TODO: replace stylist_invitation[0] with the latest invitation retrieved from the array (when it would be done on the backend)
          return new ConfirmCodeSuccessAction(
            params.phone,
            tokenData,
            stylist_invitation && stylist_invitation[0],
            profile_status,
            profile
          );
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
        this.performTokenSave(action.token)
          .then(() => action)
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

  private performTokenSave(token: AuthTokenModel): Promise<void> {
    switch(config && config.role) {
      case 'stylist': {
        const storage = AppModule.injector.get(AppStorage); // dynamic inject
        return storage.set('authToken', token.token);
      }
      case 'client':
      default:
        return saveToken(token);
    }
  }
}
