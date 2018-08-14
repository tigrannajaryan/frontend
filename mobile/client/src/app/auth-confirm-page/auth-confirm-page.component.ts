import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { componentIsActive } from '~/core/utils/component-is-active';

import { PageNames } from '~/core/page-names';
import { RequestState } from '~/core/api/request.models';
import {
  AuthState,
  ConfirmCodeAction,
  RequestCodeAction,
  ResetConfirmCodeErrorAction,
  selectConfirmCodeError,
  selectConfirmCodeState,
  selectRequestCodeState
} from '~/core/reducers/auth.reducer';
import { selectInvitedByStylist, StylistState } from '~/core/reducers/stylists.reducer';
import { AuthEffects } from '~/core/effects/auth.effects';

import { ApiError, FieldErrorItem } from '~/shared/api-errors';

export const CODE_LENGTH = 6;

@IonicPage()
@Component({
  selector: 'page-auth-confirm',
  templateUrl: 'auth-confirm-page.component.html'
})
export class AuthConfirmPageComponent {
  @ViewChild('input') codeInput;

  RequestState = RequestState; // expose to view

  digits = Array(CODE_LENGTH).fill(undefined);

  phone: string;
  code: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(CODE_LENGTH),
    Validators.maxLength(CODE_LENGTH)
  ]);

  confirmCodeState: Observable<RequestState>;

  requestCodeState: Observable<RequestState>;
  resendCodeCountdown: Observable<number>;

  error: Observable<ApiError>;
  invalidCodeError = new FieldErrorItem('code', { code: 'err_invalid_sms_code' });

  constructor(
    private authEffects: AuthEffects,
    private navCtrl: NavController,
    private navParams: NavParams,
    private store: Store<AuthState & StylistState>
  ) {
  }

  ionViewWillEnter(): void {
    this.phone = this.navParams.get('phone');

    // Send code confirmation request on valid code entered
    this.code.statusChanges
      .takeWhile(componentIsActive(this))
      .filter(() => this.code.valid)
      .subscribe(() => {
        this.store.dispatch(new ConfirmCodeAction(this.phone, this.code.value));
      });

    // Handle confirmation request state
    this.confirmCodeState = this.store.select(selectConfirmCodeState);

    // Navigate next on token saved
    this.authEffects.saveToken
      .takeWhile(componentIsActive(this))
      .filter((isTokenSaved: boolean) => isTokenSaved)
      .withLatestFrom(this.store)
      .subscribe(([isTokenSaved, state]) => {
        const invitation = selectInvitedByStylist(state);
        if (invitation) {
          this.navCtrl.setRoot(PageNames.StylistInvitation);
        } else {
          this.navCtrl.setRoot(PageNames.Stylists);
        }
      });

    // Handle code verification error
    this.error = this.store.select(selectConfirmCodeError);

    // Re-request code
    this.requestCodeState = this.store.select(selectRequestCodeState);
    this.resendCodeCountdown = this.authEffects.codeResendCountdown;
  }

  ionViewDidEnter(): void {
    setTimeout(() => { // autofocus code input
      this.codeInput.setFocus();
    });
  }

  onResendCode(): void {
    this.store.dispatch(new RequestCodeAction(this.phone));
  }

  onFocusCode(): void {
    if (this.code.value.length === CODE_LENGTH) { // only happen when error occurred
      this.code.patchValue('');
      this.store.dispatch(new ResetConfirmCodeErrorAction());
    }
  }

  onAutoblurCode(event: any): void {
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
