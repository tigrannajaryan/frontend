import { Pipe, PipeTransform } from '@angular/core';

import { ApiError, ApiFieldAndNonFieldErrors, FieldOrNonFieldErrorItem } from '~/shared/api-errors';

/**
 * Check if the specified field or non field error item exists in the apiError.
 * Uses isEqual member function to check for equality of the error item.
 */
export function hasError(apiError: ApiError, subError: FieldOrNonFieldErrorItem): boolean {
  if (apiError && apiError instanceof ApiFieldAndNonFieldErrors) {
    return apiError.errors.some(e => e.isEqual(subError));
  }
  return false;
}

@Pipe({ name: 'hasError' })
export class HasErrorPipe implements PipeTransform {

  transform(apiError: ApiError, subError: FieldOrNonFieldErrorItem): boolean {
    return hasError(apiError, subError);
  }
}
