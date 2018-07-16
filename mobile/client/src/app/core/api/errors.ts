import { HttpErrorResponse } from '@angular/common/http';

import {
  ApiError,
  ApiFieldError,
  ApiHighLevelErrorResponse,
  ApiNonFieldError,
  ApiNotAllowedMethodError,
  ApiObjectNotFoundError,
  ApiRecognisableError,
  ApiRequestUnauthorizedError,
  ApiUnknownError,
  HighLevelErrorCode,
  ServerInternalError,
  ServerUnknownError,
  ServerUnreachableError
} from '~/core/api/errors.models';

export function processApiResponseError(error: HttpErrorResponse): ApiError[] {
  if (error.error instanceof ErrorEvent) {
    // Client-side error, e.g. network error or exception thrown.
    return [new ServerUnreachableError(error.error)];
  }

  // We have a response, check the status.
  switch (error.status) {
    case 400: // bad request
    case 409: // conflict on post/put
      // Match API errors:
      return getRecognisableErrors(error.error);

    case 401: // unauthorized
      return [new ApiRequestUnauthorizedError(error.error)];

    default:
      if (error.status >= 500 && error.status <= 599) {
        return [new ServerInternalError(error.error)];
      }
      return [new ServerUnknownError(error.error)];
  }
}

/**
 * Errors matching function.
 * @param  error response from the API that contains high level error code, non-fields and fields errors
 * @return an array of matched errors
 */
export function getRecognisableErrors(error: ApiHighLevelErrorResponse): ApiRecognisableError[] {
  switch (error.code) {

    // An exception occured in the API, the `non_field_errors` or(and) `field_errors` should be returned
    case HighLevelErrorCode.err_api_exception: {
      const nonFieldErrors = error.non_field_errors.map(e => new ApiNonFieldError(e));

      const fieldErrors =
        Object.keys(error.field_errors)
          .reduce((all, field) => {
            const errors = error.field_errors[field];
            return all.concat(
              errors.map(e => new ApiFieldError(field, e))
            );
          }, []);

      return [...nonFieldErrors, ...fieldErrors];
    }

    // Authentication with provided token is failed
    case HighLevelErrorCode.err_authentication_failed:
    case HighLevelErrorCode.err_unauthorized:
      return [new ApiRequestUnauthorizedError(error)];

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
