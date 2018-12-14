import { HttpErrorResponse } from '@angular/common/http';

import { capitalizeFirstChar, formatStr } from '~/shared/utils/string-utils';
import { FieldErrorModel, fieldErrorMsgs, HighLevelErrorCode, NonFieldErrorModel, nonFieldErrorMsgs } from '~/shared/api-error-codes';

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

  /**
   * Return true if the other instance is 'like' this one. The definition
   * of 'like' is left to each class that derives from this one. isLike operation
   * is used when matching errors in e.g. `hideGenericAlertOnErrorsLike` flag.
   */
  isLike(other: ApiError): boolean {
    return false;
  }
}

/**
 * Server is unreachable or returned an internal or unknown error.
 */
export class ServerUnreachableOrInternalError extends ApiError {
  isLike(other: ApiError): boolean {
    return other instanceof ServerUnreachableOrInternalError;
  }
}

/**
 * Server is unreachable (no network, or server is down, etc)
 */
export class ServerUnreachableError extends ServerUnreachableOrInternalError {
  constructor() {
    super('ServerUnreachableError');
  }

  isLike(other: ApiError): boolean {
    return other instanceof ServerUnreachableError;
  }
}

/**
 * Internal Server Error (5xx HTTP status)
 */
export class ServerInternalError extends ServerUnreachableOrInternalError {
  constructor(error: string) {
    super(error);
  }

  isLike(other: ApiError): boolean {
    return other instanceof ServerInternalError;
  }
}

/**
 * Some server error but we don't know what exactly it is
 */
export class ServerUnknownError extends ServerUnreachableOrInternalError {
  constructor(error: string) {
    super(error);
  }

  isLike(other: ApiError): boolean {
    return other instanceof ServerUnknownError;
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

export interface ApiRequestOptions {
  // If falsy will results in notifying ServerStatusTracker when
  // ApiFieldAndNonFieldErrors happens, and ServerStatusTracker will show an alert.
  // If set to true then this behavior is disabled. If this option is omitted
  // the default value is false, which means if you don't pass this option
  // alert will be shown automatically on error. If you don't want this behavior
  // and want to handle the errors in a custom way then set this value to true
  // and handle ApiFieldAndNonFieldErrors in your code that calls API functions.
  hideGenericAlertOnFieldAndNonFieldErrors?: boolean;

  // If true will results in NOT notifying ServerStatusTracker on ANY errors.
  // This means ServerStatusTracker will not show any UI indicators that something
  // when wrong. Usually used when the call you make can be lost and there is nothing
  // that we want to do about it or even let user know about it (e.g. sending
  // supplementary analytics data failed).
  hideAllErrors?: boolean;

  // Similar to above. If error happens which is like one of the elements of
  // hideGenericAlertOnErrorsLike array then do not show the error.
  // Uses ApiError.isLike() function to decide "likeness" of errors.
  hideGenericAlertOnErrorsLike?: ApiError[];
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

  isLike(other: ApiError): boolean {
    return other instanceof ApiClientError && this.status === other.status;
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

  isLike(other: ApiError): boolean {
    if (other instanceof ApiFieldAndNonFieldErrors && this.errors.length === other.errors.length) {
      for (let i = 0; i < this.errors.length; i++) {
        if (!this.errors[i].isEqual(other.errors[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
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

export interface ProcessApiResponseErrorResult {
  error: ApiError;
  notifyTracker: boolean;
}

/**
 * Process HttpErrorResponse and convert it to an array of ApiError items.
 */
export function processApiResponseError(error: any, options: ApiRequestOptions): ProcessApiResponseErrorResult {
  let retApiVal: ProcessApiResponseErrorResult;

  if (error instanceof HttpErrorResponse) {
    if (error.error instanceof ErrorEvent || !error.status) {
      // Connection error, e.g. network is down.
      retApiVal = { error: new ServerUnreachableError(), notifyTracker: true };
    } else {
      const status = String(error.status);
      if (/^4\d\d/.test(status)) { // 4xx
        retApiVal = process4xxErrorResponse(error.status, error.error, options);
      } else if (/^5\d\d/.test(status)) { // 5xx
        retApiVal = { error: new ServerInternalError(error.error), notifyTracker: true };
      } else {
        retApiVal = { error: new ServerUnknownError(error.error), notifyTracker: true };
      }
    }
  } else {
    retApiVal = { error: new ServerUnknownError(error.error), notifyTracker: true };
  }

  if (options && options.hideAllErrors) {
    // Caller asked to hide all errors, don't notify tracker.
    retApiVal.notifyTracker = false;
  } else if (options && options.hideGenericAlertOnErrorsLike) {
    // if we have any error like options.hideGenericAlertOnErrorsLike then return false
    // for the second value.
    retApiVal.notifyTracker = !options.hideGenericAlertOnErrorsLike.some(e => e.isLike(retApiVal.error));
  }

  return retApiVal;
}

/**
 * Processs 4xx error response data structure and converts into correct type of ApiError.
 */
export function process4xxErrorResponse(
  httpStatus: number, error: ApiErrorResponse,
  options: ApiRequestOptions): ProcessApiResponseErrorResult {

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

      const notifyTracker = !(options && options.hideGenericAlertOnFieldAndNonFieldErrors);

      return { error: new ApiFieldAndNonFieldErrors([...nonFieldErrors, ...fieldErrors]), notifyTracker };
    }

    // Authentication with provided token is failed
    case HighLevelErrorCode.err_authentication_failed:
    case HighLevelErrorCode.err_unauthorized:
      return { error: new ApiClientError(HttpStatus.unauthorized, error), notifyTracker: true };

    // The endpoint is not found
    case HighLevelErrorCode.err_not_found:
      return {
        error: new ApiClientError(HttpStatus.notFound, error), notifyTracker: true
      };

    // The method is not allowed for endpoint
    case HighLevelErrorCode.err_method_not_allowed:
      return {
        error: new ApiClientError(HttpStatus.methodNotSupported, error), notifyTracker: true
      };

    // Nothing from above
    default:
      return {
        error: new ApiClientError(httpStatus, error), notifyTracker: true
      };
  }
}
