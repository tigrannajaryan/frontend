import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isValidNumber } from 'libphonenumber-js';

export function phoneValidator(countryCode: string): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    // tslint:disable-next-line:no-null-keyword
    return isValidNumber(control.value, countryCode) ? null : { phone: {value: control.value} };
  };
}
