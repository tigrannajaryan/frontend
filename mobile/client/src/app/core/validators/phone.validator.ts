import { AbstractControl, ValidatorFn } from '@angular/forms';
import { CountryCode, isValidNumber } from 'libphonenumber-js';

export function phoneValidator(countryCode: CountryCode): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    // tslint:disable-next-line:no-null-keyword
    return isValidNumber(control.value, countryCode) ? null : { phone: {value: control.value} };
  };
}
