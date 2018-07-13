export enum HighLevelErrorCode {
  err_api_exception = 'err_api_exception',
  err_authentication_failed = 'err_authentication_failed',
  err_unauthorized = 'err_unauthorized',
  err_not_found = 'err_not_found',
  err_method_not_allowed = 'err_method_not_allowed'
}

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

export interface ApiError {
  code: string;
  details?: {
    description: string;
  };
}

export interface ApiErrorResponse extends ApiError {
  code: HighLevelErrorCode;
  non_field_errors: ApiError[];
  field_errors: {
    [fieldName: string]: ApiError[];
  };
}

export abstract class BaseError {
  constructor(public error: ApiError | Error) {}
}

export abstract class ApiBaseError extends BaseError {
  abstract isSame(error: BaseError): boolean;

  constructor(
    public code: string,
    public error: ApiError
  ) {
    super(error);
  }
}

export class ApiNonFieldError extends ApiBaseError {
  isSame(error: ApiNonFieldError): boolean {
    return error.code === this.code;
  }
}

export class ApiFieldError extends ApiBaseError {
  constructor(
    public field: string,
    public code: string,
    public error: ApiError
  ) {
    super(code, error);
  }

  isSame(error: ApiFieldError): boolean {
    return (
      error.field === this.field &&
      error.code === this.code
    );
  }
}

export class ApiObjectNotFoundError extends BaseError {}
export class ApiNotAllowedMethodError extends BaseError {}

export class ApiUnknownError extends BaseError {}

export class ServerUnreachableError extends BaseError {}
export class ServerInternalError extends BaseError {}
export class ServerUnknownError extends BaseError {}

export class RequestUnauthorizedError extends BaseError {}
