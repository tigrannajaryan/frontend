import { FieldErrorModel, HighLevelErrorCode, NonFieldErrorModel } from '~/shared/api-error-codes';

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

  /**
   * Equality comparison function. Must be overriden in derived classes.
   */
  isEqual(_error: ApiError): boolean {
    return false;
  }
}

/**
 * An API error caused by incorrect request from the client. Corresponds
 * to 4xx HTTP status codes.
 */
export class ApiClientError extends ApiError {
  constructor(readonly error: ApiErrorResponse) {
    super('ApiClientError');
  }

  isEqual(other: ApiClientError): boolean {
    return other instanceof ApiClientError && other.error.code === this.error.code;
  }
}

/**
 * Internal Server Error (5xx HTTP status)
 */
export class ServerInternalError extends ApiError {
  constructor(error: string) {
    super(error);
  }
}

/**
 * When error.status not from [400, 401, 5xx]
 */
export class ServerUnknownError extends ApiError {
  constructor(error: string) {
    super(error);
  }
}

/**
 * If we have an error on the client-side an ErrorEvent is returned
 * (see https://angular.io/guide/http#getting-error-details)
 * Normally happens when there is no connection to the server.
 */
export class ServerUnreachableError extends ApiError {
  constructor(error: ErrorEvent) {
    super('ServerUnreachableError');
  }
}

/**
 * Authorization failure error.
 */
export class ApiRequestUnauthorizedError extends ApiClientError { }

/**
 * The requested endpoint is not found.
 */
export class ApiObjectNotFoundError extends ApiClientError { }

/**
 * The request method is not allowed for the endpoint
 */
export class ApiNotAllowedMethodError extends ApiClientError { }

/**
 * Nothing above, an error with a high-level code we cannot understand
 */
export class ApiUnknownError extends ApiClientError { }

/**
 * An error that is not related to any particular request field
 */
export class ApiNonFieldError extends ApiError {
  constructor(readonly error: NonFieldErrorModel) {
    super('ApiNonFieldError');
  }

  isEqual(other: ApiNonFieldError): boolean {
    return other instanceof ApiNonFieldError && this.error.code === other.error.code;
  }

  handleGlobally(): boolean {
    // Handling specific non-field errors is a responsibility of API caller,
    // we will not handle this error globally.
    return false;
  }
}

/**
 * An error that relates to some particular request field
 */
export class ApiFieldError extends ApiError {
  constructor(
    readonly field: string,
    readonly error: FieldErrorModel
  ) {
    super('ApiFieldError');
  }

  isEqual(other: ApiFieldError): boolean {
    return other instanceof ApiFieldError && this.error.code === other.error.code && other.field === this.field;
  }

  handleGlobally(): boolean {
    // Handling specific field errors is a responsibility of API caller,
    // we will not handle this error globally.
    return false;
  }
}
