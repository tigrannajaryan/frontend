import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { componentIsActive } from '~/shared/utils/component-is-active';

import { RequestState } from '~/shared/api/request.models';
import {
  AuthState,
  ConfirmCodeAction,
  RequestCodeAction,
  ResetConfirmCodeErrorAction,
  selectConfirmCodeError,
  selectConfirmCodeState,
  selectRequestCodeState
} from '~/shared/storage/auth.reducer';

import { AuthEffects } from '~/shared/storage/auth.effects';
import { ApiError, FieldErrorItem } from '~/shared/api-errors';
import { AuthProcessState } from '~/shared/storage/auth-process-state';

import { AppStorage } from '~/shared/storage/app-storage';

import { PushNotification } from '~/shared/push-notification';
import { CodeData, CodeInputComponent } from '~/shared/components/code-input/code-input.component';
import { ENV } from '~/environments/environment.default';

import { createNavHistoryList, isRegistrationComplete } from '~/core/functions';
import { clearAllDataStores } from '~/core/data.module';

@Component({
  selector: 'page-auth-confirm',
  templateUrl: 'auth-confirm.component.html'
})
export class AuthConfirmPageComponent {
  @ViewChild(CodeInputComponent) codeInput: CodeInputComponent;

  RequestState = RequestState; // expose to view

  phone: string;

  confirmCodeState: Observable<RequestState>;

  requestCodeState: Observable<RequestState>;
  resendCodeCountdown: Observable<number>;

  error: Observable<ApiError>;
  invalidCodeError = new FieldErrorItem('code', { code: 'err_invalid_sms_code' });

  constructor(
    private storage: AppStorage,
    private authEffects: AuthEffects,
    private authDataState: AuthProcessState,
    private navCtrl: NavController,
    private navParams: NavParams,
    public pushNotification: PushNotification,
    private store: Store<AuthState>
  ) {
  }

  ionViewWillEnter(): void {
    this.phone = this.navParams.get('phone');

    // Handle confirmation request state
    this.confirmCodeState = this.store.select(selectConfirmCodeState);

    // Navigate next on token saved
    this.authEffects.saveToken
      .takeWhile(componentIsActive(this))
      .filter(isTokenSaved => isTokenSaved)
      .withLatestFrom(this.store)
      .subscribe(async ([data, state]) => {
        // This code is not good: "data" has no static typing and it is
        // completely unclear what it is really. The compiler doesn' know either :-(
        // rxjs+ngrx -> unreadable, unmaintainable, fragile code.
        // Supposedly "data" should contain the stylist profile and
        // I could use it to populate ProfileDataStore, but I am not going to since
        // I am not sure and I don't want to make this code even less understable.

        // Clear cached data when logging in. This is to avoid using previous user's
        // cached data if we login using a different user. We also clear cache during
        // logout, but it may not be enough since it is possible to be forcedly logged
        // out without performing logout user action (e.g. on token expiration).
        clearAllDataStores();

        // true = This is a new user, enable help screens
        // false = Set it back to false for the case when we change user
        this.storage.set('showHomeScreenHelp', !isRegistrationComplete(data.profileStatus));

        const requiredPages = createNavHistoryList(data.profileStatus);
        this.navCtrl.setPages(requiredPages);

        if (ENV.ffEnablePushNotifications) {
          // We are now in the app, init the push notifications
          this.pushNotification.init();
        }
      });

    // Handle code verification error
    this.error = this.store.select(selectConfirmCodeError);

    // Re-request code
    this.requestCodeState = this.store.select(selectRequestCodeState);

    this.authDataState.beginRerequestCountdown();
    this.resendCodeCountdown = this.authDataState.rerequestCodeTimeoutAsObservable();
  }

  ionViewDidEnter(): void {
    this.codeInput.autofocus();
  }

  onResendCode(): void {
    this.store.dispatch(new RequestCodeAction(this.phone));
    this.authDataState.beginRerequestCountdown();
  }

  onCodeChange(codeData: CodeData): void {
    const { code, valid } = codeData;

    if (valid) {
      this.store.dispatch(new ConfirmCodeAction(this.phone, code));
    } else if (code.length === 0) {
      // if there was an error and the input had been cleared out
      this.store.dispatch(new ResetConfirmCodeErrorAction());
    }
  }
}
