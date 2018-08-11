import { FieldErrorModel, fieldErrorMsgs, NonFieldErrorModel, nonFieldErrorMsgs } from '~/shared/api-error-codes';

/**
 * Base class for all errors thrown by ApiService classes.
 */
export class ApiError {
  getMessage(): string {
    return 'ApiError';
  }
}

/**
 * Server is unreachable or returned an internal error.
 */
export class ServerUnreachableOrInternalError extends ApiError {
}

export class ServerUnreachableError extends ServerUnreachableOrInternalError { }

export class ServerInternalError extends ServerUnreachableOrInternalError {
  constructor(readonly errorMsg: string) {
    super();
  }

  getMessage(): string {
    return this.errorMsg;
  }
}

export class ServerUnknownError extends ServerUnreachableOrInternalError {
  constructor(readonly errorMsg?: string) {
    super();
  }

  getMessage(): string {
    return this.errorMsg;
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
 * Server returns 4xx response with a body.
 */
export class ServerErrorResponse extends ApiError {
  constructor(
    readonly status: HttpStatus,
    readonly errorBody: any
  ) {
    super();
  }
}

/**
 * Simple string formatting function. Substitutes parameters in the
 * form {d} by correspoding item in args array.
 * @param str the format string
 * @param args the substitution values
 */
function formatStr(str: string, ...args: any[]): string {
  return str.replace(/{(\d+)}/g, (match, num) => {
    num = parseInt(num, 10);
    return args[num] !== undefined ? args[num] : match;
  });
}

function capitalizeFirstChar(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str[0].toLocaleUpperCase() + str.substring(1);
}

/**
 * Server response that contains errors about request felds.
 */
export class ServerFieldError extends ApiError {
  readonly errors: Map<string, FieldErrorModel[]> = new Map();

  constructor(response: any) {
    super();

    // tslint:disable-next-line:forin
    for (const field in response) {
      // Create a Map of errors with keys matching field names
      // and values being an array of FieldError instances.
      this.errors.set(field, response[field]);
    }
  }

  /**
   * Return human-readable description of the error.
   */
  getMessage(): string {
    let result = '';
    this.errors.forEach(
      (fieldErrors, fieldName) => {
        const fieldMsg = fieldErrors.map(fieldError => {
          const msg = fieldErrorMsgs.get(fieldError.code);
          if (msg) {
            fieldName = capitalizeFirstChar(fieldName);
            return formatStr(msg, fieldName);
          } else {
            return fieldError.code;
          }
        }).join('\n');

        result = result + (result ? '\n' : '') + fieldMsg;
      }
    );
    return result;
  }
}

/**
 * Server response that contains errors not related to request felds.
 */
export class ServerNonFieldError extends ApiError {
  readonly errors: NonFieldErrorModel[] = [];

  constructor(readonly status: HttpStatus, nonFieldErrors: NonFieldErrorModel[]) {
    super();
    this.errors = nonFieldErrors;
  }

  /**
   * Return human-readable description of the error.
   */
  getMessage(): string {
    return this.errors.map(item => {
      const msg = nonFieldErrorMsgs.get(item.code);
      return msg ? msg : item.code;
    }).join('\n');
  }
}
