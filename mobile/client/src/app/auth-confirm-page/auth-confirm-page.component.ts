import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { componentIsActive } from '~/core/utils/component-is-active';

import { PageNames } from '~/core/page-names';
import {
  AuthState,
  ConfirmCodeAction,
  RequestCodeAction,
  RESEND_CODE_TIMEOUT_SECONDS,
  selectCanRequestCode,
  selectCanRequestCodeInSeconds,
  selectConfirmCodeErrors,
  selectConfirmCodeLoading,
  selectPhone,
  selectRequestCodeLoading,
  selectRequestCodeSucceeded
} from '~/core/reducers/auth.reducer';
import { AuthEffects } from '~/core/effects/auth.effects';

import { ApiFieldError, AuthFieldErrorCodes } from '~/core/api/errors.models';

export const CODE_LENGTH = 6;

enum SendCodeState {
  Timeout,
  NotStarted,
  InProgress,
  VerificationInProgress
}

@IonicPage()
@Component({
  selector: 'page-auth-confirm',
  templateUrl: 'auth-confirm-page.component.html'
})
export class AuthConfirmPageComponent {
  @ViewChild('input') codeInput;

  digits = Array(CODE_LENGTH).fill(undefined);

  phone: string;
  code: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(CODE_LENGTH),
    Validators.maxLength(CODE_LENGTH)
  ]);

  sendCodeState: SendCodeState;
  SendCodeState = SendCodeState; // expose to view
  resendCodeCountdown: Observable<number>;

  errors: Observable<string>;
  invalidCodeError = new ApiFieldError('code', { code: AuthFieldErrorCodes.err_invalid_sms_code });

  isLoading = false;
  isPhoneResending: Observable<boolean>;

  constructor(
    private authEffects: AuthEffects,
    private navCtrl: NavController,
    private store: Store<AuthState>
  ) {
  }

  ionViewWillEnter(): void {
    // Show phone in header
    this.store
      .select(selectPhone)
      .takeWhile(componentIsActive(this))
      .subscribe((phone: string) => {
        this.phone = phone;
      });

    // Set `sendCodeState` to InProgress on code sending
    this.store
      .select(selectRequestCodeLoading)
      .takeWhile(componentIsActive(this))
      .filter(Boolean)
      .subscribe(() => {
        this.sendCodeState = SendCodeState.InProgress;
      });

    // Set `sendCodeState` to Timeout on code sent and create countdown
    this.store
      .select(selectRequestCodeSucceeded)
      .takeWhile(componentIsActive(this))
      .filter(Boolean)
      .withLatestFrom(this.store)
      .subscribe(([_, state]) => {
        this.sendCodeState = SendCodeState.Timeout;

        const seconds = selectCanRequestCodeInSeconds()(state);
        this.resendCodeCountdown = this.createResendCodeCountdown(seconds);
      });

    // Set `sendCodeState` to NotStarted on timeout expired
    this.store
      .select(selectCanRequestCode())
      .takeWhile(componentIsActive(this))
      .filter(Boolean)
      .subscribe(() => {
        this.sendCodeState = SendCodeState.NotStarted;
      });

    // Send code confirmation request on valid code entered
    this.code.statusChanges
      .takeWhile(componentIsActive(this))
      .subscribe(() => {
        if (this.code.valid) {
          this.store.dispatch(new ConfirmCodeAction(this.code.value));
        }
      });

    // Set `sendCodeState` to VerificationInProgress on confirmation request sent
    this.store
      .select(selectConfirmCodeLoading)
      .takeWhile(componentIsActive(this))
      .filter(Boolean)
      .subscribe(() => {
        this.sendCodeState = SendCodeState.VerificationInProgress;
      });

    // Navigate on token saved
    this.authEffects.saveToken
      .takeWhile(componentIsActive(this))
      .filter(Boolean)
      .withLatestFrom(this.store)
      .subscribe(([_, store]) => {
        this.navCtrl.setRoot(PageNames.Services);
      });

    // Handle errors
    this.errors = this.store.select(selectConfirmCodeErrors);
  }

  ionViewDidEnter(): void {
    setTimeout(() => {
      this.codeInput.setFocus();
    });
  }

  resendCode(): void {
    this.store.dispatch(new RequestCodeAction(this.phone));
  }

  verifyCode(event: any): void {
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

  private removeCountdown(): void {
    this.resendCodeCountdown = undefined;
    this.sendCodeState = SendCodeState.NotStarted;
  }

  private createResendCodeCountdown(seconds: number): Observable<number> {
    return (
      Observable
        .timer(0, 1000)
        .withLatestFrom(this.store)
        .takeWhile(([i, state]) => {
          const canRequestCode = selectCanRequestCode()(state);
          if (canRequestCode) {
            this.removeCountdown();
          }
          return !canRequestCode;
        })
        .map(([i, state]) => {
          const remaining = seconds - i;
          return remaining > 0 ? remaining : 0;
        })
    );
  }
}
