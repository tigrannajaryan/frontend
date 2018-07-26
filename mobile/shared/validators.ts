import { AbstractControl, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

/**
 * Helps to add true/false function to form control validators:
 * ```
 *   new FormControl(…, [
 *     predicateValidator(() => true) // true – valid
 *   ])
 * ```
 * @param  predicate function to check for validity
 * @return angular validator function
 */
export function predicateValidator(predicate: (...args: any[]) => boolean): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    // tslint:disable-next-line:no-null-keyword
    return predicate() ? null : { predicate: {value: control.value} };
  };
}

export class EmailValidator implements Validator {

  private readonly LOCAL_ADDR = /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+$/i;
  private readonly DOMAIN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

  validate(control: AbstractControl): ValidationErrors | null {
    return this.isEmail(control.value) ? undefined : {email: true};
  }

  /**
   * Taken from https://github.com/scottgonzalez/sane-email-validation/blob/master/index.js
   * @param str - email to be validated
   * @returns true or false if it is email or not
   */
  protected isEmail(str: string): boolean {
    if (!str) {
      return false;
    }
    const parts = str.split('@');
    if (parts.length !== 2) {
      return false;
    }
    if (!this.LOCAL_ADDR.test(parts[0])) {
      return false;
    }
    return this.DOMAIN.test(parts[1]);
  }

}
