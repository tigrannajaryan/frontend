import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

import { BaseService } from '~/shared/api/base-service';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { UserContext } from '~/shared/user-context';
import { ApiResponse } from '~/shared/api/base.models';
import { AuthCredentials, AuthResponse } from './auth-api-models';

export interface AuthError {
  non_field_errors?: string[];
  email?: string[];
  password?: string[];
}

export interface TokenStorage {
  get(): string;
  set(token: string): void;
}

/**
 * AuthServiceProvider provides authentication against server API.
 */
@Injectable()
export class AuthApiService extends BaseService {

  private authToken: string;
  private tokenStorage: TokenStorage;

  constructor(
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker,
    protected appContext: UserContext
  ) {
    super(http, logger, serverStatus);
  }

  init(tokenStorage: TokenStorage): void {
    // Read previously saved authToken (if any).
    this.tokenStorage = tokenStorage;
    this.authToken = this.tokenStorage.get();
  }

  /**
   * Authenticate using the API. If successfull remembers the auth response
   * and token which can be later obtained via getAuthToken().
   */
  doAuth(credentials: AuthCredentials): Observable<ApiResponse<AuthResponse>> {
    return this.processAuthResponse(
      () => this.post<AuthResponse>('auth/get-token', credentials));
  }

  /**
   * Register a new user authenticate using the API. If successfull remembers the auth response
   * and token which can be later obtained via getAuthToken().
   */
  registerByEmail(credentials: AuthCredentials): Observable<ApiResponse<AuthResponse>> {
    return this.processAuthResponse(
      () => this.post<AuthResponse>('auth/register', credentials));
  }

  logout(): void {
    this.setAuthResponse(undefined);
  }

  /**
   * Return token remembered after the last succesfull authentication.
   */
  getAuthToken(): string {
    return this.authToken;
  }

  refreshAuth(): Observable<ApiResponse<AuthResponse>> {
    const request = { token: this.authToken };
    return this.processAuthResponse(
      () => this.post<AuthResponse>('auth/refresh-token', request));
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
          this.setAuthResponse(response.response);
        } else {
          // Failed authentication. Clear previously saved successfull response (if any).
          this.setAuthResponse(undefined);
          this.logger.error('Authentication failed:', response.error.getMessage());
        }
        return response;
      });
  }

  /**
   * Set the auth response. Remembers it in local storage, so it persists.
   * Passing undefined for response effectively logs out from current session.
   */
  private setAuthResponse(response: AuthResponse): void {
    this.authToken = response ? response.token : undefined;

    if (response && response.profile && response.profile.uuid) {
      this.appContext.setUserId(response.profile.uuid.toString());
    } else {
      this.appContext.setUserId(undefined);
    }

    // Save the authToken for later use. This allows to use the App without re-login.
    this.tokenStorage.set(this.authToken);
  }
}
