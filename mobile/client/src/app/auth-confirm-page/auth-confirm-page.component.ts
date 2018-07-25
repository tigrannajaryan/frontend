import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { componentIsActive } from '~/core/utils/component-is-active';

import { PageNames } from '~/core/page-names';
import {
  AuthSendCodeState,
  AuthState,
  ConfirmCodeAction,
  RequestCodeAction,
  selectConfirmCodeErrors,
  selectSendCodeState
} from '~/core/reducers/auth.reducer';
import { AuthEffects } from '~/core/effects/auth.effects';

import { ApiFieldError, AuthFieldErrorCodes } from '~/core/api/errors.models';

export const CODE_LENGTH = 6;

@IonicPage()
@Component({
  selector: 'page-auth-confirm',
  templateUrl: 'auth-confirm-page.component.html'
})
export class AuthConfirmPageComponent {
  @ViewChild('input') codeInput;

  AuthSendCodeState = AuthSendCodeState; // expose to view

  digits = Array(CODE_LENGTH).fill(undefined);

  phone: string;
  code: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(CODE_LENGTH),
    Validators.maxLength(CODE_LENGTH)
  ]);

  // TODO: subscribe to verification request loading
  isLoading = false;

  sendCodeState: Observable<AuthSendCodeState>;
  resendCodeCountdown: Observable<number>;

  errors: Observable<string>;
  invalidCodeError = new ApiFieldError('code', { code: AuthFieldErrorCodes.err_invalid_sms_code });

  constructor(
    private authEffects: AuthEffects,
    private navCtrl: NavController,
    private navParams: NavParams,
    private store: Store<AuthState>
  ) {
  }

  ionViewWillEnter(): void {
    this.phone = this.navParams.get('phone');

    // Send code confirmation request on valid code entered
    this.code.statusChanges
      .takeWhile(componentIsActive(this))
      .filter(() => this.code.valid)
      .subscribe(() => {
        this.store.dispatch(new ConfirmCodeAction(this.code.value));
      });

    // Navigate next on token saved
    this.authEffects.saveToken
      .takeWhile(componentIsActive(this))
      .filter((isTokenSaved: boolean) => isTokenSaved)
      .subscribe(() => {
        this.navCtrl.setRoot(PageNames.Services);
      });

    // Handle code verification errors
    this.errors = this.store.select(selectConfirmCodeErrors);

    // Re-request code
    this.sendCodeState = this.store.select(selectSendCodeState);
    this.resendCodeCountdown = this.authEffects.codeResendCountdown;
  }

  ionViewDidEnter(): void {
    setTimeout(() => { // autofocus code input
      this.codeInput.setFocus();
    });
  }

  resendCode(): void {
    this.store.dispatch(new RequestCodeAction(this.phone));
  }

  autoblurCode(event: any): void {
    const code: number = event.which || Number(event.code);
    const key: string = event.key || String.fromCharCode(code);

    if (!isNaN(parseInt(key, 10)) && event.target.value.length === CODE_LENGTH - 1) {
      event.target.selectionStart = event.target.selectionEnd = 0;
      event.target.scrollLeft = 0;
      event.target.blur();
      setTimeout(() => {
        this.code.patchValue(event.target.value + key);
      });
    }
  }
}
