import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { getCountryCallingCode } from 'libphonenumber-js';

import { phoneValidator } from '~/core/validators/phone.validator';
import { DEFAULT_COUNTRY_CODE, getCountryEmojiFlag, getUnifiedPhoneValue } from '~/core/directives/phone-input.directive';
import Countries from 'country-data/data/countries.json';

export interface PhoneData {
  phone: string;
  valid: boolean;
}

@Component({
  selector: 'phone-input',
  templateUrl: 'phone-input.component.html'
})
export class PhoneInputComponent {
  countries = Countries && Countries.filter(country => country.countryCallingCodes.length > 0);

  countryCode: FormControl = new FormControl(DEFAULT_COUNTRY_CODE, [Validators.required]);
  phone: FormControl = new FormControl('', [Validators.required, phoneValidator(DEFAULT_COUNTRY_CODE)]);

  @Output() phoneChange = new EventEmitter<PhoneData>();

  onChange(): void {
    this.phoneChange.emit({
      phone: getUnifiedPhoneValue(this.phone.value, this.countryCode.value),
      valid: this.phone.valid
    });
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
