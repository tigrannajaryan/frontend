import { AbstractControl, ValidatorFn } from '@angular/forms';
import { CountryCode, parseNumber } from 'libphonenumber-js';

export function phoneValidator(countryCode: CountryCode): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    // tslint:disable-next-line:no-null-keyword
    return parseNumber(control.value, countryCode).phone ? null : { phone: {value: control.value} };
  };
}
