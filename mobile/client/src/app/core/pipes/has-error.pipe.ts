import { Pipe, PipeTransform } from '@angular/core';

import { ApiDerivedError } from '~/core/api/errors.models';

export function hasError(errors, error): boolean {
  if (errors && errors.length > 0) {
    if (error instanceof ApiDerivedError) {
      return (
        errors
          .filter(e => e instanceof ApiDerivedError)
          .some(e => e.isSame(error))
      );
    }
  }
  return false;
}

@Pipe({ name: 'hasError' })
export class HasErrorPipe implements PipeTransform {

  transform(errors: any[], error: any): boolean {
    return hasError(errors, error);
  }
}
