// Mapping of all field error codes to human readable messages
const fieldErrorMsgs: Object = {
  required: '{0} is required.',
  invalid: '{0} is invalid.',
  null: '{0} cannot be blank.',
  blank: '{0} cannot be blank.',
  min_length: '{0} is too short.',
  max_length: '{0} is too long.',
  max_value: '{0} is too small.',
  min_value: '{0} is too large.',
  invalid_choice: '{0} is invalid.',
  empty: '{0} cannot be empty.',
  invalid_image: 'Image is invalid.',
  date: '{0} date is in wrong format.',
  datetime: '{0} date/time is in wrong format.',
  err_email_already_taken: 'Email is already registered, try logging in.',
  err_incorrect_user_role: 'No user role',
  err_unique_stylist_phone: 'The phone number is registered to another stylist. Contact us if you have any questions.',
  err_unique_client_phone: 'The phone number belongs to another client.',
  err_unique_client_name: 'A client with the name already exists.',
  err_invalid_query_for_home: 'Query should be one of \'upcoming\', \'past\' or \'today\'.',
  err_appointment_in_the_past: 'Cannot add appointment for a past date and time.',
  err_appointment_intersection: 'Cannot add appointment intersecting with another.',
  err_appointment_outside_working_hours: 'Cannot add appointment outside working hours.',
  err_appointment_non_working_day: 'Cannot add appointment on non-working day.',
  err_service_does_not_exist: 'Stylist does not have such service.',
  err_service_required: 'At least one service must be supplied when creating an appointment.',
  err_non_addon_service_required: 'At least one non-addon service must be supplied when creating an appointment.',
  err_client_does_not_exist: 'This client either does not exist or not related to the stylist.',
  err_status_not_allowed: 'This status cannot be set for appointment.',
  err_no_second_checkout: 'Appointment can only be checked out once.',
  err_appointment_does_not_exist: 'The appointment either does not exists or does not belong to current stylist.',
  err_stylist_is_already_in_preference: 'The stylist is already a preference.',
  err_invalid_stylist_uuid: 'Invalid Stylist UUID',
  err_wait_to_rerequest_new_code: 'Minimum 2 minutes wait required to re-request new code.'
};

// Mapping of all non-field error codes to human readable messages
const nonFieldErrorMsgs: Object = {
  err_signature_expired: 'Login expired, try logging in again.',
  err_invalid_access_token: 'Internal error: JWT token is malformed.',
  err_auth_account_disabled: 'This account is disabled.',
  err_auth_unable_to_login_with_credentials: 'Invalid email or password.',
  err_refresh_expired: 'Login expired, try logging in again.',
  err_orig_iat_is_required: 'Internal error: malformed token.',
  err_available_time_not_set: 'Day marked as available, but time is not set.'
};

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

export class ServerUnreachableError extends ServerUnreachableOrInternalError { }

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
  readonly errors: Map<string, FieldError[]> = new Map();

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
  getStr(): string {
    let result = '';
    this.errors.forEach(
      (fieldErrors, fieldName) => {
        const fieldMsg = fieldErrors.map(fieldError => {
          const msg = fieldErrorMsgs[fieldError.code];
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
  readonly errors: NonFieldError[] = [];

  constructor(readonly status: HttpStatus, nonFieldErrors: FieldError[]) {
    super();
    this.errors = nonFieldErrors;
  }

  /**
   * Return human-readable description of the error.
   */
  getStr(): string {
    return this.errors.map(item => {
      const msg = nonFieldErrorMsgs[item.code];
      return msg ? msg : item.code;
    }).join('\n');
  }
}
