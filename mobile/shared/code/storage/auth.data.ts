import { Injectable } from '@angular/core';

import { AuthService } from '~/shared/api/auth.api';
import { ConfirmCodeParams, ConfirmCodeResponse, GetCodeParams, GetCodeResponse } from '~/shared/api/auth.models';
import { ApiResponse } from '~/shared/api/base.models';
import { ApiFieldAndNonFieldErrors, ApiRequestOptions, FieldErrorItem, NonFieldErrorItem } from '~/shared/api-errors';

/**
 * This is not an original DataStore. It just helps to reuse auth requests with ease.
 */
@Injectable()
export class AuthDataStore {

  static waitNewCodeError =
    new ApiFieldAndNonFieldErrors(
      [new NonFieldErrorItem({ code: 'err_wait_to_rerequest_new_code' })]
    );

  static invalidConfirmCodeError =
    new ApiFieldAndNonFieldErrors(
      [new FieldErrorItem('code', { code: 'err_invalid_sms_code' })]
    );

  constructor(
    private authService: AuthService
  ) {
  }

  async getCode(phone: string): Promise<ApiResponse<GetCodeResponse>> {
    const params: GetCodeParams = { phone };
    const options: ApiRequestOptions = {
      hideGenericAlertOnErrorsLike: [AuthDataStore.waitNewCodeError]
    };
    const { response, error } = await this.authService.getCode(params, options).toPromise();
    if (error && AuthDataStore.waitNewCodeError.isLike(error)) {
      // Return no error on code re-request timeout error:
      return { response: {}, error: undefined };
    }
    return { response, error };
  }

  confirmCode(phone: string, code: string): Promise<ApiResponse<ConfirmCodeResponse>> {
    const params: ConfirmCodeParams = { phone, code };
    const options: ApiRequestOptions = {
      // The invalidConfirmCodeError is handled customly by the component, skip common handling:
      hideGenericAlertOnErrorsLike: [AuthDataStore.invalidConfirmCodeError]
    };
    return this.authService.confirmCode(params, options).toPromise();
  }
}
