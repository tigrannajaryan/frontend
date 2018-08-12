import { HttpErrorResponse } from '@angular/common/http';

import { capitalizeFirstChar, formatStr } from '~/shared/utils/string-utils';
import { FieldErrorModel, fieldErrorMsgs, HighLevelErrorCode, NonFieldErrorModel, nonFieldErrorMsgs } from '~/shared/api-error-codes';
import { ServerStatusError, ServerStatusErrorType } from '~/shared/server-status-tracker';

/*

Hierarchy of API error classes.

                                                    +-----------+
                                                    |   Error   |
                                                    +-----+-----+
                                                          |
                                                    +-----+-----+
                                                    | ApiError  |
                                                    +-----+-----+
                                                          |
                                       +------------------+---------+-------------------------+
                                       |                            |                         |
                     +-----------------+----------------+   +-------+--------+  +-------------+-------------+
                     | ServerUnreachableOrInternalError |   | ApiClientError |  | ApiFieldAndNonFieldErrors |
                     +-----------------+----------------+   +----------------+  |                           |
                                       |                                        |    +--------------+       |
             +-------------------------------------------------+                |    |FieldErrorItem|-+     |
             |                         |                       |                |    +--------------+ |     |
+------------+-----------+  +----------+---------+  +----------+----------+     |      +--------------+     |
| ServerUnreachableError |  | ServerUnknownError |  | ServerInternalError |     |                           |
+------------------------+  +--------------------+  +---------------------+     |  +-----------------+      |
                                                                                |  |NonFieldErrorItem|-+    |
                                                                                |  +-----------------+ |-+  |
                                                                                |    +-----------------+ |  |
                                                                                |      +-----------------+  |
                                                                                |                           |
                                                                                +---------------------------+

*/

/**
 * Base class for all posible errors returned from the API request.
 *
 * This class is inherited from built-in Error class to make sure it is treated properly
 * by frameworks (Angular, I am looking at you) which assume that anything that
 * is not derived from Error is not worth to be treated as first class citizen
 * (see e.g. https://github.com/angular/angular/blob/master/packages/core/src/view/errors.ts#L25)
 * Inheriting this from Error ensure Angular doesn't try to tinker with this object
 * when it catches and delivers to unhandled ErrorHandler and that ErrorHandler receives
 * the error call stack intact.
 * Solution inspired by https://medium.com/@xjamundx/custom-javascript-errors-in-es6-aa891b173f87
 */
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
  }

  /**
   * This is used to indicate that dispatching of ApiCommonErrorAction
   * is needed when this error occures.
   */
  handleGlobally(): boolean {
    // By default we handle all errors globally. Derived classes must override
    // this function if needed.
    return true;
  }

  getMessage(): string {
    return this.message;
  }
}

/**
 * Server is unreachable or returned an internal or unknown error.
 */
export class ServerUnreachableOrInternalError extends ApiError {
}

/**
 * Server is unreachable (no network, or server is down, etc)
 */
export class ServerUnreachableError extends ServerUnreachableOrInternalError {
  constructor() {
    super('ServerUnreachableError');
  }
}

/**
 * Internal Server Error (5xx HTTP status)
 */
export class ServerInternalError extends ServerUnreachableOrInternalError {
  constructor(error: string) {
    super(error);
  }
}

/**
 * Some server error but we don't know what exactly it is
 */
export class ServerUnknownError extends ServerUnreachableOrInternalError {
  constructor(error: string) {
    super(error);
  }
}

/**
 * HTTP Status Codes
 */
export enum HttpStatus {
  badRequest = 400,
  unauthorized = 401,
  notFound = 404,
  methodNotSupported = 405
}

/**
 * Server returns 4xx response with a body. This does not include recognized cases like
 * field errors or non-field errors which are represented by ApiFieldAndNonFieldErrors.
 */
export class ApiClientError extends ApiError {
  constructor(
    readonly status: HttpStatus,
    readonly errorBody: any
  ) {
    super('ApiClientError');
  }
}

/**
 * Error response data structure returned by API calls in case of an error
 */
export interface ApiErrorResponse {
  code: HighLevelErrorCode;
  non_field_errors?: NonFieldErrorModel[];
  field_errors?: {
    [fieldName: string]: FieldErrorModel[];
  };
}

/**
 * An error that is not related to any particular request field. Can contain and array
 * of field or non-field error items.
 */
export class ApiFieldAndNonFieldErrors extends ApiError {
  constructor(readonly errors: FieldOrNonFieldErrorItem[]) {
    super('ApiFieldAndNonFieldErrors');
  }

  handleGlobally(): boolean {
    // Handling specific non-field errors is a responsibility of API caller,
    // we will not handle this error globally.
    return false;
  }

  /**
   * Return human-readable description of the error.
   */
  getMessage(): string {
    return this.errors.map(item => item.getMessage()).join('\n');
  }
}

/**
 * Base class for field or non-field error items contained in ApiFieldAndNonFieldErrors.
 */
export class FieldOrNonFieldErrorItem {
  isEqual(other: FieldOrNonFieldErrorItem): boolean {
    return false;
  }

  getMessage(): string {
    return '';
  }
}

/**
 * An non-field error that is not related to any particular request field.
 */
export class NonFieldErrorItem extends FieldOrNonFieldErrorItem {
  constructor(readonly error: NonFieldErrorModel) {
    super();
  }

  isEqual(other: FieldOrNonFieldErrorItem): boolean {
    return other instanceof NonFieldErrorItem && this.error.code === other.error.code;
  }

  /**
   * Return human-readable description of the error.
   */
  getMessage(): string {
    return nonFieldErrorMsgs.get(this.error.code);
  }
}

/**
 * An error that relates to some particular request field.
 */
export class FieldErrorItem extends FieldOrNonFieldErrorItem {
  constructor(
    readonly field: string,
    readonly error: FieldErrorModel
  ) {
    super();
  }

  isEqual(other: FieldOrNonFieldErrorItem): boolean {
    return other instanceof FieldErrorItem && this.error.code === other.error.code && other.field === this.field;
  }

  /**
   * Return human-readable description of the error.
   */
  getMessage(): string {
    const msg = fieldErrorMsgs.get(this.error.code);
    if (msg) {
      const fieldName = capitalizeFirstChar(this.field);
      return formatStr(msg, fieldName);
    } else {
      return this.error.code;
    }
  }
}

export interface ErrorProcessingResult {
  apiError: ApiError;
  serverStatusError?: ServerStatusError;
}

/**
 * Process HttpErrorResponse and convert it to an array of ApiError items.
 */
export function processApiResponseError(error: any): ErrorProcessingResult {
  if (error instanceof HttpErrorResponse) {
    if (error.error instanceof ErrorEvent || !error.status) {
      // Connection error, e.g. network is down.
      return {
        apiError: new ServerUnreachableError(),
        serverStatusError: { type: ServerStatusErrorType.noConnection }
      };
    }
    const status = String(error.status);
    if (/^4\d\d/.test(status)) { // 4xx
      return process4xxErrorResponse(error.status, error.error);
    }
    if (/^5\d\d/.test(status)) { // 5xx
      return {
        apiError: new ServerInternalError(error.error),
        serverStatusError: { type: ServerStatusErrorType.internalServerError }
      };
    }
  }
  return {
    apiError: new ServerUnknownError(error.error),
    serverStatusError: { type: ServerStatusErrorType.unknownServerError }
  };
}

/**
 * Processs 4xx error response data structure and converts into correct type of ApiError.
 */
export function process4xxErrorResponse(httpStatus: number, error: ApiErrorResponse): ErrorProcessingResult {
  switch (error.code) {

    // An exception occured in the API, the 'non_field_errors' or(and) 'field_errors' should be returned
    case HighLevelErrorCode.err_api_exception: {
      const nonFieldErrors = error.non_field_errors ?
        error.non_field_errors.map(e => new NonFieldErrorItem(e)) : [];

      const fieldErrors: FieldErrorItem[] = error.field_errors ?
        Object.keys(error.field_errors)
          .reduce((all: FieldErrorItem[], field) => {
            const errors = error.field_errors[field];
            return all.concat(
              errors.map(e => new FieldErrorItem(field, e))
            );
          }, []) : [];

      return {
        apiError: new ApiFieldAndNonFieldErrors([...nonFieldErrors, ...fieldErrors])
      };
    }

    // Authentication with provided token is failed
    case HighLevelErrorCode.err_authentication_failed:
    case HighLevelErrorCode.err_unauthorized:
      return {
        apiError: new ApiClientError(HttpStatus.unauthorized, error),
        serverStatusError: { type: ServerStatusErrorType.unauthorized }
      };

    // The endpoint is not found
    case HighLevelErrorCode.err_not_found:
      return {
        apiError: new ApiClientError(HttpStatus.notFound, error),
        serverStatusError: { type: ServerStatusErrorType.clientRequestError }
      };

    // The method is not allowed for endpoint
    case HighLevelErrorCode.err_method_not_allowed:
      return {
        apiError: new ApiClientError(HttpStatus.methodNotSupported, error),
        serverStatusError: { type: ServerStatusErrorType.clientRequestError }
      };

    // Nothing from above
    default:
      return {
        apiError: new ApiClientError(httpStatus, error),
        serverStatusError: { type: ServerStatusErrorType.unknownServerError }
      };
  }
}
