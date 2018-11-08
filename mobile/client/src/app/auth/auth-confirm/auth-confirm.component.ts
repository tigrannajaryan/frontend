import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { componentIsActive } from '~/shared/utils/component-is-active';

import { PageNames } from '~/core/page-names';
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
import { selectInvitedByStylist, StylistState } from '~/core/reducers/stylists.reducer';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { AuthEffects } from '~/shared/storage/auth.effects';

import { ApiError, FieldErrorItem } from '~/shared/api-errors';
import { AuthProcessState } from '~/shared/storage/auth-process-state';

import { StylistPageParams } from '~/stylists/stylist/stylist.component';

import { CodeData, CodeInputComponent } from '~/shared/components/code-input/code-input.component';
import { PushNotification } from '~/shared/push/push-notification';

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
    private authEffects: AuthEffects,
    private authDataState: AuthProcessState,
    private navCtrl: NavController,
    private navParams: NavParams,
    private preferredStylistsData: PreferredStylistsData,
    private pushNotification: PushNotification,
    private store: Store<AuthState & StylistState>
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
      .subscribe(async ([isTokenSaved, state]) => this.onCodeConfirmed(state));

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

  async onCodeConfirmed(state: AuthState & StylistState): Promise<void> {
    // Get the list of preferred stylists
    const preferredStylists = await this.preferredStylistsData.get();

    // Also get the invitation (if any)
    const invitation = selectInvitedByStylist(state);
    if (preferredStylists.length > 0) {
      // We already have a preferred stylist, we can go to main tabs screen.

      // But first show push permission asking screen if needed and wait until the user makes a choice
      await this.pushNotification.showPermissionScreen(true);

      // All set, show main screen.
      this.navCtrl.setRoot(PageNames.MainTabs);
    } else if (invitation) {
      // No preferred stylist, but we have an invitation from a stylist, show it.
      const data: StylistPageParams = { stylist: invitation };
      this.navCtrl.setRoot(PageNames.Stylist, { data });
    } else {
      // No preferred stylist, no invitation, brand new client. Start with
      // educational screen.
      this.navCtrl.setRoot(PageNames.HowMadeWorks);
    }
  }
}
