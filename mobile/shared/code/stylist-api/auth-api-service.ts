import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { BaseApiService } from './base-api-service';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { UserContext } from '~/shared/user-context';
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
export class AuthApiService extends BaseApiService {

  private authToken: string;
  private tokenStorage: TokenStorage;

  constructor(
    protected http: HttpClient,
    protected logger: Logger,
    protected serverStatus: ServerStatusTracker,
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
  async doAuth(credentials: AuthCredentials): Promise<AuthResponse> {
    return this.processAuthResponse(
      () => this.post<AuthResponse>('auth/get-token', credentials));
  }

  /**
   * Register a new user authenticate using the API. If successfull remembers the auth response
   * and token which can be later obtained via getAuthToken().
   */
  async registerByEmail(credentials: AuthCredentials): Promise<AuthResponse> {
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

  async refreshAuth(): Promise<AuthResponse> {
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
  private async processAuthResponse(apiCall: () => Promise<AuthResponse>): Promise<AuthResponse> {
    return apiCall()
      .then(response => {
        this.setAuthResponse(response);
        return response;
      })
      .catch(e => {
        // Failed authentication. Clear previously saved successfull response (if any).
        this.setAuthResponse(undefined);
        this.logger.error('Authentication failed:', JSON.stringify(e));
        throw e;
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
