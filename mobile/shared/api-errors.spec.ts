import { HighLevelErrorCode } from '~/shared/api-error-codes';
import {
  ApiClientError,
  ApiErrorResponse,
  ApiFieldAndNonFieldErrors,
  FieldErrorItem,
  HttpStatus,
  NonFieldErrorItem,
  process4xxErrorResponse
} from '~/shared/api-errors';

describe('errors', () => {
  it('process4xxErrorResponse should convert err_authentication_failed', () => {
    const errorResponse: ApiErrorResponse = {
      code: HighLevelErrorCode.err_authentication_failed
    };

    const error = process4xxErrorResponse(HttpStatus.unauthorized, errorResponse);

    expect(error).toEqual(
      new ApiClientError(HttpStatus.unauthorized, errorResponse)
    );
  });

  it('process4xxErrorResponse should convert empty err_api_exception', () => {
    const errorResponse: ApiErrorResponse = {
      code: HighLevelErrorCode.err_api_exception
    };

    const error = process4xxErrorResponse(HttpStatus.badRequest, errorResponse);

    expect(error).toEqual(new ApiFieldAndNonFieldErrors([])
    );
  });

  it('process4xxErrorResponse should convert field errors of err_api_exception', () => {
    const errorResponse: ApiErrorResponse = {
      code: HighLevelErrorCode.err_api_exception,
      field_errors: {
        email: [{ code: 'err_email_already_taken' }]
      }
    };

    const error = process4xxErrorResponse(HttpStatus.badRequest, errorResponse);

    expect(error).toEqual(new ApiFieldAndNonFieldErrors([new FieldErrorItem('email', { code: 'err_email_already_taken' })])
    );
  });

  it('process4xxErrorResponse should convert field and non-field errors of err_api_exception', () => {
    const errorResponse: ApiErrorResponse = {
      code: HighLevelErrorCode.err_api_exception,
      non_field_errors: [{ code: 'err_wait_to_rerequest_new_code' }],
      field_errors: {
        email: [{ code: 'err_email_already_taken' }]
      }
    };

    const error = process4xxErrorResponse(HttpStatus.badRequest, errorResponse);

    expect(error).toEqual(new ApiFieldAndNonFieldErrors([
        new NonFieldErrorItem({ code: 'err_wait_to_rerequest_new_code' }),
        new FieldErrorItem('email', { code: 'err_email_already_taken' })
      ])
    );
  });
});
