import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { componentIsActive } from '~/shared/utils/component-is-active';
import { PhoneData } from '~/shared/components/phone-input/phone-input.component';

import { RequestState } from '~/shared/api/request.models';
import {
  AuthState,
  RequestCodeAction,
  RequestCodeSuccessAction,
  selectRequestCodeState
} from '~/shared/storage/auth.reducer';
import { AuthEffects } from '~/shared/storage/auth.effects';

import { PageNames } from '~/core/page-names';

@Component({
  selector: 'page-auth-start',
  templateUrl: 'auth-start.component.html'
})
export class AuthPageComponent {
  phone: string;

  isLoading = false;
  isDisabled = true;

  constructor(
    private authEffects: AuthEffects,
    private navCtrl: NavController,
    private store: Store<AuthState>
  ) {
  }

  ionViewWillEnter(): void {
    this.store
      .select(selectRequestCodeState)
      .takeWhile(componentIsActive(this))
      .map((requestState: RequestState) => requestState === RequestState.Loading)
      .subscribe((isLoading: boolean) => {
        this.isLoading = isLoading;
      });
  }

  onPhoneChange(phoneData: PhoneData): void {
    const { phone, valid } = phoneData;

    this.phone = phone;
    this.isDisabled = !valid;
  }

  submit(): void {
    this.store.dispatch(new RequestCodeAction(this.phone));

    this.authEffects.getCodeRequest
      .first() // subscribes once
      .filter(action => action instanceof RequestCodeSuccessAction)
      .subscribe(() => {
        this.navCtrl.push(PageNames.AuthConfirm, { phone: this.phone });
      });
  }
}
