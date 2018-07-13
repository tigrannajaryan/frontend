import { HttpErrorResponse } from '@angular/common/http';

import {
  ApiErrorResponse,
  ApiFieldError,
  ApiNonFieldError,
  ApiNotAllowedMethodError,
  ApiObjectNotFoundError,
  ApiUnknownError,
  BaseError,
  HighLevelErrorCode,
  RequestUnauthorizedError,
  ServerInternalError,
  ServerUnknownError,
  ServerUnreachableError
} from '~/core/api/errors.models';

export function processApiResponseError(error: HttpErrorResponse | any): BaseError[] {
  if (error instanceof HttpErrorResponse) {
    if (!error.status) {
      // No response at all, probably no network connection or server is down.
      return [new ServerUnreachableError(error)];
    }

    // We have a response, check the status.
    switch (error.status) {
      case 400: // bad request
        return getApiErrors(error.error);

      case 401: // unauthorized
        return [new RequestUnauthorizedError(error)];

      default:
        if (error.status >= 500 && error.status <= 599) {
          return [new ServerInternalError(error)];
        }
    }
  }

  // Server returned something we don't understand or some other unexpected error happened.
  return [new ServerUnknownError(error)];
}

// Errors matching function
export function getApiErrors(error: ApiErrorResponse): BaseError[] {
  switch (error.code) {

    // An exception occured in the API, the `non_field_errors` or(and) `field_errors` should be returned
    case HighLevelErrorCode.err_api_exception: {
      const nonFieldErrors = error.non_field_errors.map(e => new ApiNonFieldError(e.code, error));

      const fieldErrors =
        Object.keys(error.field_errors)
          .reduce((all, field) => {
            const errors = error.field_errors[field];
            return all.concat(
              errors.map(e => new ApiFieldError(field, e.code, error))
            );
          }, []);

      return [...nonFieldErrors, ...fieldErrors];
    }

    // Authentication with provided token is failed
    case HighLevelErrorCode.err_authentication_failed:
    case HighLevelErrorCode.err_unauthorized:
      return [new RequestUnauthorizedError(error)];

    // The endpoint is not found
    case HighLevelErrorCode.err_not_found:
      return [new ApiObjectNotFoundError(error)];

    // The method is not allowed for endpoint
    case HighLevelErrorCode.err_method_not_allowed:
      return [new ApiNotAllowedMethodError(error)];

    // Nothing from above
    default:
      return [new ApiUnknownError(error)];
  }
}
