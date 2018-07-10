import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { PageNames } from '~/core/page-names';
import { AuthState, RequestCodeAction } from '~/core/reducers/auth.reducer';
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

  constructor(
    private navCtrl: NavController,
    private store: Store<AuthState>
  ) {
  }

  countrySelected(): string {
    this.phone.setValidators([Validators.required, phoneValidator(this.countryCode.value)]);
  }

  submit(): void {
    const phone = getUnifiedPhoneValue(this.phone.value, this.countryCode.value);
    this.store.dispatch(new RequestCodeAction(phone));

    this.navCtrl.push(PageNames.AuthConfirm);
  }
}
