import { AbstractControl, ValidatorFn } from '@angular/forms';

interface ValidationError {
  [key: string]: any;
}

export function invalidFor(invalidValue: any, error: ValidationError): ValidatorFn {
  return (control: AbstractControl): ValidationError | null => {
    // tslint:disable-next-line:no-null-keyword
    return control.value === invalidValue ? error : null;
  };
}
