import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { getCountryCallingCode } from 'libphonenumber-js';
import Countries from 'country-data/data/countries.json';

import { phoneValidator } from '~/shared/validators/phone.validator';
import { DEFAULT_COUNTRY_CODE, getCountryEmojiFlag, getUnifiedPhoneValue } from '~/shared/directives/phone-input.directive';

export interface PhoneData {
  phone: string;
  valid: boolean;
}

export interface CountryData {
  alpha2: string,
  countryCallingCodes: string[];
  currencies: string[];
  emoji: string;
  languages: string[];
  name: string;
  ioc: string;
}

function prepareCountriesData(Countries: CountryData[]) {
  return (
    Countries
      // Limit countries bu country.ioc to omit countries like UM (+1 United States Minor Outlying Islands).
      // Phone library we use don’t accept UM country code. US can be safely used instead of it.
      .filter(country => country.ioc && country.countryCallingCodes.length > 0)
  );
}

@Component({
  selector: 'phone-input',
  templateUrl: 'phone-input.component.html'
})
export class PhoneInputComponent {
  static countries = Countries && prepareCountriesData(Countries);

  countries = PhoneInputComponent.countries;

  countryCode: FormControl = new FormControl(DEFAULT_COUNTRY_CODE, [Validators.required]);
  phone: FormControl = new FormControl('', [Validators.required, phoneValidator(DEFAULT_COUNTRY_CODE)]);

  @Output() phoneChange = new EventEmitter<PhoneData>();

  onChange(): void {
    let phone = getUnifiedPhoneValue(this.phone.value, this.countryCode.value);
    // Remove \u202c and/or \u202d (see https://madebeauty.atlassian.net/browse/FRON-1022):
    phone = phone.replace(/\\.*$/gm, '');
    this.phoneChange.emit({ phone, valid: this.phone.valid });
  }

  onCountrySelected(): void {
    this.phone.setValidators([Validators.required, phoneValidator(this.countryCode.value)]);
    this.phone.updateValueAndValidity();
    this.onChange();
  }

  getPhoneCode(): string {
    return `${getCountryEmojiFlag(this.countryCode.value)} +${getCountryCallingCode(this.countryCode.value)}`;
  }
}
