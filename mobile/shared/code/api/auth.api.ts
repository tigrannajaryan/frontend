import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ApiRequestOptions } from '~/shared/api-errors';
import { ApiResponse } from '~/shared/api/base.models';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base-service';
import {
  AuthResponse,
  ConfirmCodeParams,
  ConfirmCodeResponse,
  GetCodeParams,
  GetCodeResponse,
  UserRole
} from '~/shared/api/auth.models';

import config from '~/auth/config.json';
import { UserContext } from '~/shared/user-context';

@Injectable()
export class AuthService extends BaseService {

  static role: UserRole = (config && config.role) || 'client';

  constructor(
    protected userContext: UserContext,
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker
  ) {
    super(http, logger, serverStatus);
  }

  getCode(data: GetCodeParams, options: ApiRequestOptions): Observable<ApiResponse<GetCodeResponse>> {
    return this.post<GetCodeResponse>('auth/get-code', { ...data, role: AuthService.role }, undefined, options);
  }

  confirmCode(data: ConfirmCodeParams, options: ApiRequestOptions): Observable<ApiResponse<ConfirmCodeResponse>> {
    return this.processAuthResponse(
      () => this.post<ConfirmCodeResponse>('auth/code/confirm', { ...data, role: AuthService.role }, undefined, options));
  }

  refreshAuth(authToken: string): Observable<ApiResponse<AuthResponse>> {
    const request = { token: authToken };
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
  }
}
