/**
 * Base class for all errors thrown by ApiService classes.
 */
export class ApiError {
}

/**
 * Server is unreachable or returned an internal error.
 */
export class ServerUnreachableOrInternalError extends ApiError {
}

export class ServerUnreachableError extends ServerUnreachableOrInternalError {}

export class ServerInternalError extends ServerUnreachableOrInternalError {
  constructor(readonly errorMsg: string) {
    super();
  }
}

export class ServerUnknownError extends ServerUnreachableOrInternalError {
  constructor(readonly errorMsg?: string) {
    super();
  }
}

/**
 * HTTP Status Codes
 */
export enum HttpStatus {
  badRequest = 400,
  unauthorized = 401
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
 * A single error that is not related to a request field.
 */
export interface NonFieldError {
  code: string;
}

/**
 * A single error related to a field in the request.
 */
export interface FieldError {
  code: string;
}

/**
 * Server response that contains errors about request felds.
 */
export class ServerFieldError extends ApiError {
  readonly errors: Map<string, FieldError[]> = new Map();

  constructor(response: any) {
    super();

    // tslint:disable-next-line:forin
    for (const field in response) {
      // Create a Map of errors with keys matching field names
      // and values being an array of FieldError instances.
      this.errors.set(
        field,
        response[field].map(error => ({ code: error }))
      );
    }
  }
}

/**
 * Server response that contains errors not related to request felds.
 */
export class ServerNonFieldError extends ApiError {
  readonly errors: NonFieldError[] = [];

  constructor(readonly status: HttpStatus, response: string[]) {
    super();
    this.errors = response.map(str => ({ code: str }));
  }

  /**
   * Return human-readable description of the error.
   * TODO: map error codes to human readable text.
   */
  getStr(): string {
    return this.errors.map(item => item.code).join('\n');
  }
}
