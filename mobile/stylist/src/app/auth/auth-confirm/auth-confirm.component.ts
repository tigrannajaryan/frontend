import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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

import { AuthApiService } from '~/shared/stylist-api/auth-api-service';
import { AppStorage } from '~/shared/storage/app-storage';
import { TokenStorageImpl } from '~/app.component';

import { CodeData, CodeInputComponent } from '~/shared/components/code-input/code-input.component';

import { createNavHistoryList } from '~/core/functions';

@IonicPage()
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
    private authApiService: AuthApiService,
    private authEffects: AuthEffects,
    private authDataState: AuthProcessState,
    private navCtrl: NavController,
    private navParams: NavParams,
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
        this.authApiService.init(new TokenStorageImpl(this.storage));

        const requiredPages = createNavHistoryList(data.profileStatus);
        this.navCtrl.setPages(requiredPages);
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
