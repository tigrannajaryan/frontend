import { AbstractControl, ValidatorFn } from '@angular/forms';
import { parseNumber } from 'libphonenumber-js';

const defaultCountry = 'US';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const { phone } = parseNumber(control.value, defaultCountry);

    // tslint:disable-next-line:no-null-keyword
    return phone ? null : { phone: {value: control.value} };
  };
}
