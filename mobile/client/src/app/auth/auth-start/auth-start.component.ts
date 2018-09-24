import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { getCountryCallingCode } from 'libphonenumber-js';

import { componentIsActive } from '~/core/utils/component-is-active';

import { PageNames } from '~/core/page-names';
import { RequestState } from '~/core/api/request.models';
import {
  AuthState,
  RequestCodeAction,
  RequestCodeSuccessAction,
  selectRequestCodeState
} from '~/auth/auth.reducer';
import { AuthEffects } from '~/auth/auth.effects';
import { phoneValidator } from '~/core/validators/phone.validator';

import { DEFAULT_COUNTRY_CODE, getCountryEmojiFlag, getUnifiedPhoneValue } from '~/core/directives/phone-input.directive';
import Countries from 'country-data/data/countries.json';

@IonicPage()
@Component({
  selector: 'page-auth-start',
  templateUrl: 'auth-start.component.html'
})
export class AuthPageComponent {
  countries = Countries && Countries.filter(country => country.countryCallingCodes.length > 0);

  countryCode: FormControl = new FormControl(DEFAULT_COUNTRY_CODE, [Validators.required]);
  phone: FormControl = new FormControl('', [Validators.required, phoneValidator(DEFAULT_COUNTRY_CODE)]);

  isLoading = false;

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

  countrySelected(): void {
    this.phone.setValidators([Validators.required, phoneValidator(this.countryCode.value)]);
  }

  getPhoneCode(): string {
    return `${getCountryEmojiFlag(this.countryCode.value)} +${getCountryCallingCode(this.countryCode.value)}`;
  }

  submit(): void {
    const phone = getUnifiedPhoneValue(this.phone.value, this.countryCode.value);

    this.store.dispatch(new RequestCodeAction(phone));

    this.authEffects.getCodeRequest
      .first() // subscribes once
      .filter(action => action instanceof RequestCodeSuccessAction)
      .subscribe(() => {
        this.navCtrl.push(PageNames.AuthConfirm, { phone });
      });
  }
}
