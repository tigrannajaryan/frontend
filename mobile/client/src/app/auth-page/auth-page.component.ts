import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { getCountryCallingCode } from 'libphonenumber-js';

import { componentIsActive } from '~/core/utils/component-is-active';

import { PageNames } from '~/core/page-names';
import {
  AuthState,
  RequestCodeAction,
  ResetAction,
  selectRequestCodeLoading,
  selectRequestCodeSucceeded
} from '~/core/reducers/auth.reducer';
import { phoneValidator } from '~/core/validators/phone.validator';

import { DEFAULT_COUNTRY_CODE, getCountryEmojiFlag, getUnifiedPhoneValue } from '~/core/directives/phone-input.directive';
import Countries from 'country-data/data/countries.json';

@IonicPage()
@Component({
  selector: 'page-auth',
  templateUrl: 'auth-page.component.html'
})
export class AuthPageComponent {
  countries = Countries.filter(country => country.countryCallingCodes.length > 0);

  countryCode: FormControl = new FormControl(DEFAULT_COUNTRY_CODE, [Validators.required]);
  phone: FormControl = new FormControl('', [Validators.required, phoneValidator(DEFAULT_COUNTRY_CODE)]);

  isLoading = false;

  constructor(
    private navCtrl: NavController,
    private store: Store<AuthState>
  ) {
  }

  ionViewWillEnter(): void {
    this.store.dispatch(new ResetAction()); // reset auth requests state

    this.store
      .select(selectRequestCodeLoading)
      .takeWhile(componentIsActive(this))
      .subscribe((isLoading: boolean) => {
        this.isLoading = isLoading;
      });

    this.store
      .select(selectRequestCodeSucceeded)
      .takeWhile(componentIsActive(this))
      .subscribe((isSucceeded: boolean) => {
        if (isSucceeded) {
          this.navCtrl.push(PageNames.AuthConfirm);
        }
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
  }
}
