import { AbstractControl, ValidatorFn } from '@angular/forms';

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
