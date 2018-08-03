import { Pipe, PipeTransform } from '@angular/core';

import { ApiError } from '~/core/api/errors.models';

/**
 * Check if the specified error exists in the array of errors.
 * Uses isEqual member function to check for equality of the error.
 */
export function hasError(errors: ApiError[], error: ApiError): boolean {
  if (errors) {
    return errors.some(e => e.isEqual(error));
  }
  return false;
}

@Pipe({ name: 'hasError' })
export class HasErrorPipe implements PipeTransform {

  transform(errors: ApiError[], error: ApiError): boolean {
    return hasError(errors, error);
  }
}
