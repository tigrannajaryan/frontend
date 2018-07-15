// error.code
export enum HighLevelErrorCode {
  err_api_exception = 'err_api_exception',
  err_authentication_failed = 'err_authentication_failed',
  err_unauthorized = 'err_unauthorized',
  err_not_found = 'err_not_found',
  err_method_not_allowed = 'err_method_not_allowed'
}

// `field_errors` possible codes (not all of possible!)
export enum GenericFieldErrorCode {
  required = 'required',
  invalid = 'invalid',
  null = 'null',
  blank = 'blank',
  min_length = 'min_length',
  max_length = 'max_length',
  max_value = 'max_value',
  min_value = 'min_value',
  invalid_choice = 'invalid_choice',
  empty = 'empty',
  invalid_image = 'invalid_image',
  date = 'date',
  datetime = 'datetime'
}

type ApiErrorCode =
  | HighLevelErrorCode
  | GenericFieldErrorCode
  | string; // specific error codes

/**
 * All errors returned from the API in case of an error
 */
export interface ApiErrorResponse {
  code: ApiErrorCode;
  details?: {
    description: string;
  };
}

/**
 * High-level error response returned from the API in case of an error
 */
export interface ApiHighLevelErrorResponse extends ApiErrorResponse {
  code: HighLevelErrorCode;
  non_field_errors: ApiErrorResponse[];
  field_errors: {
    [fieldName: string]: ApiErrorResponse[];
  };
}

/**
 * Base class for all posible errors returned from the API request
 */
export class ApiError {
  /**
   * This is used to indicate that dispatching of ApiCommonErrorAction
   * is needed when this error occures.
   */
  handleGlobally = true;
}

/**
 * The API should return an ApiError in case of an error on the server-side
 */
export class ApiRecognisableError extends ApiError {
  constructor(public error: ApiErrorResponse) {
    super();
  }
}

/**
 * The API can return string body if an error cannot be handled properly
 */
export class ServerInternalError extends ApiError {
  constructor(public error: string) {
    super();
  }
}

/**
 * If we have an error on the client-side an ErrorEvent is returned
 */
export class ServerUnreachableError extends ApiError {
  constructor(public error: ErrorEvent) {
    super();
  }
}

/**
 * An error returned with distinct high-level code
 */
export class ApiHighLevelError extends ApiRecognisableError {
  constructor(public error: ApiHighLevelErrorResponse) {
    super(error);
  }
}

/**
 * Authentication fails
 */
export class RequestUnauthorizedError extends ApiHighLevelError {}

/**
 * The requested endpoint is not found
 */
export class ApiObjectNotFoundError extends ApiHighLevelError {}

/**
 * The request method is not allowed for the endpoint
 */
export class ApiNotAllowedMethodError extends ApiHighLevelError {}

/**
 * Nothing above, an error with a high-level code we cannot understand
 */
export class ApiUnknownError extends ApiHighLevelError {}

// Common errors should be handled differently from derived errors

/**
 * Errors derived from `non_field_errors` and `field_errors`
 */
export class ApiDerivedError extends ApiRecognisableError {
  handleGlobally = false;

  isSame(other: ApiDerivedError): boolean {
    return other.error.code === this.error.code;
  }
}

/**
 * An error that not relates to some particular request param
 */
export class ApiNonFieldError extends ApiDerivedError {}

/**
 * An error that relates to some particular request param
 */
export class ApiFieldError extends ApiDerivedError {
  constructor(
    public field: string,
    public error: ApiErrorResponse
  ) {
    super(error);
  }

  isSame(other: ApiFieldError): boolean {
    return super.isSame(other) && other.field === this.field;
  }
}
