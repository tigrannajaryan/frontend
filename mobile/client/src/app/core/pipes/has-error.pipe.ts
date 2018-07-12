import { Pipe, PipeTransform } from '@angular/core';

import { ApiBaseError } from '~/core/api/errors.models';

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
