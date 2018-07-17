import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { getCountryCallingCode } from 'libphonenumber-js';

import { PageNames } from '~/core/page-names';
import {
  AuthState,
  RequestCodeAction,
  ResetAction,
  selectRequestCodeLoading,
  selectRequestCodeSucceded
} from '~/core/reducers/auth.reducer';
import { phoneValidator } from '~/core/validators/phone.validator';

import { DEFAULT_COUNTRY_CODE, getUnifiedPhoneValue } from '~/core/directives/phone-input.directive';
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

  subscriptionOnLoading: Subscription;
  subscriptionOnSuccess: Subscription;

  constructor(
    private navCtrl: NavController,
    private store: Store<AuthState>
  ) {
  }

  ionViewWillEnter(): void {
    this.store.dispatch(new ResetAction());

    this.subscriptionOnLoading = this.store
      .select(selectRequestCodeLoading)
      .subscribe((isLoading: boolean) => {
        this.isLoading = isLoading;
      });

    this.subscriptionOnSuccess = this.store
      .select(selectRequestCodeSucceded)
      .subscribe((isSucceded: boolean) => {
        if (isSucceded) {
          this.navCtrl.push(PageNames.AuthConfirm);
        }
      });
  }

  ionViewWillLeave(): void {
    this.subscriptionOnLoading.unsubscribe();
    this.subscriptionOnSuccess.unsubscribe();
  }

  countrySelected(): void {
    this.phone.setValidators([Validators.required, phoneValidator(this.countryCode.value)]);
  }

  getPhoneCode(): string {
    // TODO: show flag instead of code value
    return `${this.countryCode.value} +${getCountryCallingCode(this.countryCode.value)}`;
  }

  submit(): void {
    const phone = getUnifiedPhoneValue(this.phone.value, this.countryCode.value);
    this.store.dispatch(new RequestCodeAction(phone));
  }
}
