import { Pipe, PipeTransform } from '@angular/core';

import {
  ApiBaseError,
  ApiFieldError
} from '~/core/api/errors.models';

const EMPTY_API_ERROR = { code: '' };

export class ApiFieldErrorMatch extends ApiFieldError {
  constructor(
    public field: string,
    public code: string
  ) {
    super(field, code, EMPTY_API_ERROR);
  }
}

@Pipe({ name: 'hasError' })
export class HasErrorPipe implements PipeTransform {

  transform(errors: any[], error: any): boolean {
    if (errors && errors.length > 0) {
      if (error instanceof ApiBaseError) {
        return (
          errors
            .filter(e => e instanceof ApiBaseError)
            .some(e => e.isSame(error))
        );
      }
    }
    return false;
  }
}
