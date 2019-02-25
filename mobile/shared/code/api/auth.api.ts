import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiResponse } from '~/shared/api/base.models';
import { BaseService } from '~/shared/api/base.service';
import {
  AuthResponse,
  ConfirmCodeParams,
  ConfirmCodeResponse,
  GetCodeParams,
  GetCodeResponse
} from '~/shared/api/auth.models';
import { ApiFieldAndNonFieldErrors, ApiRequestOptions, FieldErrorItem, NonFieldErrorItem } from '~/shared/api-errors';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { UserContext } from '~/shared/user-context';
import { updateProfileStatus } from '~/shared/storage/token-utils';

@Injectable()
export class AuthService extends BaseService {

  static waitNewCodeError =
    new ApiFieldAndNonFieldErrors(
      [new NonFieldErrorItem({ code: 'err_wait_to_rerequest_new_code' })]
    );

  static invalidConfirmCodeError =
    new ApiFieldAndNonFieldErrors(
      [new FieldErrorItem('code', { code: 'err_invalid_sms_code' })]
    );

  constructor(
    protected userContext: UserContext,
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getCode(phone: string): Observable<ApiResponse<GetCodeResponse>> {
    const params: GetCodeParams = { phone, role: BaseService.role };
    const options: ApiRequestOptions = {
      hideGenericAlertOnErrorsLike: [AuthService.waitNewCodeError]
    };
    return (
      this.post<GetCodeResponse>('auth/get-code', params, undefined, options)
        .map(({ response, error }) => {
          if (error && AuthService.waitNewCodeError.isLike(error)) {
            // Return no error on code re-request timeout error:
            return { response: {}, error: undefined };
          }
          return { response, error };
        })
    );
  }

  confirmCode(phone: string, code: string): Observable<ApiResponse<ConfirmCodeResponse>> {
    const params: ConfirmCodeParams = { phone, code, role: BaseService.role };
    const options: ApiRequestOptions = {
      // The invalidConfirmCodeError is handled customly by the AuthConfirm component, skip common handling:
      hideGenericAlertOnErrorsLike: [AuthService.invalidConfirmCodeError]
    };
    return this.processAuthResponse(
      () => this.post<ConfirmCodeResponse>('auth/code/confirm', params, undefined, options));
  }

  refreshAuth(authToken: string): Observable<ApiResponse<AuthResponse>> {
    const request = { token: authToken, role: BaseService.role };
    return this.processAuthResponse(
      () => this.post<AuthResponse>('auth/refresh-token', request));
  }

  logout(): void {
    this.handleAuthResponse(undefined);
  }

  /**
   * Process a response to authentication API call. If the response is successfull
   * remember it. If the call failed clear previously rememebered response.
   * @param apiCall function to call to perform the API call. Must return a promise
   *                to AuthResponse.
   * @returns the same response that it received from apiCall (or re-throws the error).
   */
  private processAuthResponse(apiCall: () => Observable<ApiResponse<AuthResponse>>): Observable<ApiResponse<AuthResponse>> {
    return apiCall()
      .map(response => {
        if (!response.error) {
          this.handleAuthResponse(response.response);
        } else {
          // Failed authentication. Clear previously saved successfull response (if any).
          this.handleAuthResponse(undefined);
          this.logger.error('Authentication failed:', response.error.getMessage());
        }
        return response;
      });
  }

  /**
   * Handles received auth response.
   */
  private handleAuthResponse(response: AuthResponse): void {
    // Let UserContext know about userId change.
    if (response && response.user_uuid) {
      this.userContext.setUserId(response.user_uuid);
    } else {
      this.userContext.setUserId(undefined);
    }

    // update profile_status
    if (response && response.profile_status) {
      updateProfileStatus(response.profile_status);
    }
  }
}
