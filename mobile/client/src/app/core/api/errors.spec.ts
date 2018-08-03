import { HighLevelErrorCode } from '~/shared/api-error-codes';
import { ApiErrorResponse, ApiFieldError, ApiNonFieldError, ApiRequestUnauthorizedError } from './errors.models';
import { convertErrorResponseToArray } from './errors';

describe('errors', () => {
  it('convertErrorResponseToArray should convert err_authentication_failed', () => {
    const error: ApiErrorResponse = {
      code: HighLevelErrorCode.err_authentication_failed
    };

    const errors = convertErrorResponseToArray(error);

    expect(errors).toEqual([new ApiRequestUnauthorizedError(error)]);
  });

  it('convertErrorResponseToArray should convert empty err_api_exception', () => {
    const error: ApiErrorResponse = {
      code: HighLevelErrorCode.err_api_exception
    };

    const errors = convertErrorResponseToArray(error);

    expect(errors).toEqual([]);
  });

  it('convertErrorResponseToArray should convert field errors of err_api_exception', () => {
    const error: ApiErrorResponse = {
      code: HighLevelErrorCode.err_api_exception,
      field_errors: {
        email: [{ code: 'err_email_already_taken' }]
      }
    };

    const errors = convertErrorResponseToArray(error);

    expect(errors).toEqual([new ApiFieldError('email', { code: 'err_email_already_taken' })]);
  });

  it('convertErrorResponseToArray should convert field and non-field errors of err_api_exception', () => {
    const error: ApiErrorResponse = {
      code: HighLevelErrorCode.err_api_exception,
      non_field_errors: [{ code: 'err_wait_to_rerequest_new_code' }],
      field_errors: {
        email: [{ code: 'err_email_already_taken' }]
      }
    };

    const errors = convertErrorResponseToArray(error);

    expect(errors).toEqual([
      new ApiNonFieldError({ code: 'err_wait_to_rerequest_new_code' }),
      new ApiFieldError('email', { code: 'err_email_already_taken' })
    ]);
  });
});
