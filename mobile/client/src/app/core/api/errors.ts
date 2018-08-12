import { HttpErrorResponse } from '@angular/common/http';

import { HighLevelErrorCode } from '~/shared/api-error-codes';
import { ServerStatusErrorType, ServerStatusTracker } from '~/shared/server-status-tracker';

import {
  ApiError,
  ApiErrorResponse,
  ApiFieldError,
  ApiNonFieldError,
  ApiNotAllowedMethodError,
  ApiObjectNotFoundError,
  ApiRequestUnauthorizedError,
  ApiUnknownError,
  ServerInternalError,
  ServerUnknownError,
  ServerUnreachableError
} from '~/core/api/errors.models';

import { AppModule } from '~/app.module';

/**
 * Process HttpErrorResponse and convert it to an array of ApiError items.
 */
export function processApiResponseError(error: HttpErrorResponse): ApiError[] {
  const serverStatus = AppModule.injector.get(ServerStatusTracker);
  if (error.error instanceof ErrorEvent || !error.status) {
    // Client-side error, e.g. network error or exception thrown.
    serverStatus.notify({ type: ServerStatusErrorType.noConnection });
    return [new ServerUnreachableError(error.error)];
  }
  const status = String(error.status);
  if (/^4\d\d/.test(status)) { // 4xx
    return convertErrorResponseToArray(error.error);
  }
  if (/^5\d\d/.test(status)) { // 5xx
    serverStatus.notify({ type: ServerStatusErrorType.internalServerError });
    return [new ServerInternalError(error.error)];
  }
  serverStatus.notify({ type: ServerStatusErrorType.unknownServerError });
  return [new ServerUnknownError(error.error)];
}

/**
 * Processs the error response data structure and converts into an array of individual ApiError items.
 * Each field error and each non-field error becomes a separate item. This array form makes it
 * easier for the callers of the APIs to find individual error items they are interested in
 * using shallow Array.filter() function (as opposed to performing deep searching inside the response
 * data structure).
 *
 * If the error response is not a field error or non-field error but is another type of client or
 * server error (such as Unauthorized Access or Internal Server Error) this error is returned
 * as the sole item of the array.
 *
 * @param  error response from the API that contains high level error code, non-fields and fields errors
 * @return an array of matched errors
 */
export function convertErrorResponseToArray(error: ApiErrorResponse): ApiError[] {
  switch (error.code) {

    // An exception occured in the API, the `non_field_errors` or(and) `field_errors` should be returned
    case HighLevelErrorCode.err_api_exception: {
      const nonFieldErrors = error.non_field_errors ?
        error.non_field_errors.map(e => new ApiNonFieldError(e)) : [];

      const fieldErrors = error.field_errors ?
        Object.keys(error.field_errors)
          .reduce((all, field) => {
            const errors = error.field_errors[field];
            return all.concat(
              errors.map(e => new ApiFieldError(field, e))
            );
          }, []) : [];

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
