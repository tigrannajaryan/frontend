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
  alpha2: string;
  name: string;
  countryCallingCodes: string[];
  ioc: string;
  emoji?: string;
  languages?: string[];
  currencies?: string[];
}

function prepareCountriesData(countries: CountryData[]): CountryData[] {
  return (
    countries
      // IOC is an International Olympic Committee’s three-letter abbreviation country code.
      // It contains 206 countries. It’s more then United Nations contain: 193 recognized members.
      // But less then we have in countries.json (> 280). The countries.json includes such as e.g. United States Minor Outlying Islands (UM)
      // that are a statistical designation defined by the International Organization for Standardization's ISO 3166-1 code.
      // Phone library we use don’t recognize country codes of non-IOC countries. Therefore we are going to hide them.
      // By limiting countries by country.ioc existence, we are able to hide countries like UM. And in the case of UM,
      // it can be safely replaced with the US because either UM or US are using +1 code for dialing.
      .filter(country => country.ioc && country.countryCallingCodes.length > 0)
      .sort((a, b) => {
        // Ensure sorting by name:
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      })
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
