import { ViewChild } from '@angular/core';
import { Events, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { ConfirmCodeResponse, GetCodeResponse } from '~/shared/api/auth.models';
import { CodeData, CodeInputComponent } from '~/shared/components/code-input/code-input.component';
import { AfterLoginEvent, SharedEventTypes } from '~/shared/events/shared-event-types';
import { AuthDataStore } from '~/shared/storage/auth.data';
import { AuthProcessState } from '~/shared/storage/auth-process-state';
import { AuthLocalData, authResponseToTokenModel, saveAuthLocalData } from '~/shared/storage/token-utils';
import { composeRequest, loading } from '~/shared/utils/request-utils';

export interface AuthConfirmParams {
  phone: string;
}

export abstract class AbstractAuthConfirmComponent {
  phone: string;

  @ViewChild(CodeInputComponent) codeInput: CodeInputComponent;

  isVerifyingCode = false;
  isRequestingNewCode = false;
  hasCodeInvalidError = false;

  resendCodeCountdown: Observable<number>;

  protected abstract auth: AuthDataStore;
  protected abstract authDataState: AuthProcessState;
  protected abstract events: Events;
  protected abstract navParams: NavParams;

  ionViewWillEnter(): void {
    const { phone } = this.navParams.get('params') as AuthConfirmParams;
    this.phone = phone;

    this.authDataState.beginRerequestCountdown();
    this.resendCodeCountdown = this.authDataState.rerequestCodeTimeoutAsObservable();
  }

  ionViewDidEnter(): void {
    this.codeInput.autofocus();
  }

  async onResendCode(): Promise<void> {
    const { response } = await composeRequest<GetCodeResponse>(
      loading((isLoading: boolean) => this.isRequestingNewCode = isLoading),
      this.auth.getCode(this.phone)
    );

    if (response) {
      this.authDataState.beginRerequestCountdown();
    }
  }

  async onCodeChange(codeData: CodeData): Promise<void> {
    const { code, valid } = codeData;

    if (code.length === 0) {
      // If there was an error and the input had been cleared out make it valid again:
      this.hasCodeInvalidError = false;
      return;
    }

    if (!valid) {
      // Do nothing
      return;
    }

    const { response, error } = await composeRequest<ConfirmCodeResponse>(
      loading((isLoading: boolean) => this.isVerifyingCode = isLoading),
      this.auth.confirmCode(this.phone, code)
    );

    if (error) {
      // Let code-input component know it has an error:
      this.hasCodeInvalidError = true;

    } else if (response) {
      // Save token
      const authLocalData: AuthLocalData = authResponseToTokenModel(response);
      await saveAuthLocalData(authLocalData);

      // Notify everyone that we are logged in
      const loginEvent: AfterLoginEvent = {
        userUuid: authLocalData.userUuid
      };
      this.events.publish(SharedEventTypes.afterLogin, loginEvent);

      this.onCodeConfirmed(response);
    }
  }

  protected abstract onCodeConfirmed(response: ConfirmCodeResponse): void | Promise<void>;
}
