import { AbstractControl, ValidatorFn } from '@angular/forms';

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    // tslint:disable-next-line:no-null-keyword
    return isEmail(control.value) ? null : { email: {value: control.value} };
  };
}

/**
 * The simplest and fastest way to check for a valid email.
 * (original idea from https://github.com/scottgonzalez/sane-email-validation/blob/master/index.js MIT)
 */
function isEmail(str: string): boolean {
  if (!str) {
    return false;
  }
  const parts = str.split('@');
  if (parts.length !== 2) {
    return false;
  }
  if (!/^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+$/i.test(parts[0])) {
    return false;
  }
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(parts[1]);
}
