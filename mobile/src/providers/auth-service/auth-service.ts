import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { BaseServiceProvider } from '../base-service';
import { StylistProfile } from '../stylist-service/stylist-models';
import { Logger } from '../../app/shared/logger';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface StylistProfileStatus {
  has_personal_data: boolean;
  has_picture_set: boolean;
  has_services_set: boolean;
  has_business_hours_set: boolean;
  has_weekday_discounts_set: boolean;
  has_other_discounts_set: boolean;
  has_invited_clients: boolean;
}

export interface AuthResponse {
  token: string;
  stylist?: StylistProfile;
  stylist_profile_status?: StylistProfileStatus;
}

export interface AuthError {
  non_field_errors?: string[];
  email?: string[];
  password?: string[];
}

/**
 * Local storage key for storing the authResponse.
 */
const storageKey = 'authResponse';

/**
 * AuthServiceProvider provides authentication against server API.
 */
@Injectable()
export class AuthServiceProvider extends BaseServiceProvider {

  private authResponse: AuthResponse;

  constructor(
    public http: HttpClient,
    public logger: Logger) {

    super(http, logger);

    // Read previously saved authResponse (if any). We are using
    // window.localStorage instead of Ionic Storage class because
    // we need synchronous behavior which window.localStorage
    // provides and Ionic Storage doesn't (Ionic Storage.get() is async).
    this.authResponse = JSON.parse(window.localStorage.getItem(storageKey));
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

  /**
   * Return token remembered after the last succesfull authentication.
   */
  getAuthToken(): string {
    return this.authResponse ? this.authResponse.token : undefined;
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
        // Save auth response
        this.authResponse = response;

        // Save the authResponse for later use. This allows us to access any page
        // without re-login, which is very useful during development/debugging
        // since you can just refresh the browser window.
        window.localStorage.setItem(storageKey, JSON.stringify(this.authResponse));

        return response;
      })
      .catch(e => {
        // Failed authentication. Clear previously saved successfull response (if any).
        this.authResponse = undefined;
        this.logger.error(e);
        throw e;
      });
  }
}
