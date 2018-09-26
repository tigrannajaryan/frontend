import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { ApiResponse } from '~/shared/api/base.models';
import { ApiClientError, HttpStatus } from '~/shared/api-errors';
import { AuthCredentials, AuthResponse, UserRole } from './auth-api-models';
import { StylistProfile } from './stylist-models';

/**
 * AuthServiceProviderMock provides authentication mocked with one
 * hard-coded set of credentials.
 */
@Injectable()
export class AuthApiServiceMock {

  /**
   * Credentials that will result in success for doAuth() function.
   */
  successAuthCredentials: AuthCredentials = {
    email: 'user@test.com', password: 'pass123', role: UserRole.stylist
  };

  private authResponse: AuthResponse;

  /**
   * Authenticate using the API. If successfull remembers the auth response
   * and token which can be later obtained via getAuthToken().
   */
  doAuth(credentials: AuthCredentials): Observable<ApiResponse<AuthResponse>> {
    if (credentials.email === this.successAuthCredentials.email &&
      credentials.password === this.successAuthCredentials.password) {
      this.authResponse = { token: 'test-token', role: UserRole.stylist };

      return Observable.of({ response: this.authResponse });
    } else {
      return Observable.of({ response: undefined, error: new ApiClientError(HttpStatus.unauthorized, undefined) });
    }
  }

  /**
   * Register a new user authenticate using the API. If successfull remembers the auth response
   * and token which can be later obtained via getAuthToken().
   */
  registerByEmail(credentials: AuthCredentials): Observable<ApiResponse<AuthResponse>> {
    this.authResponse = { token: 'test-token', role: UserRole.stylist };

    return Observable.of({ response: this.authResponse });
  }

  /**
   * Return token remembered after the last succesfull authentication.
   */
  getAuthToken(): string {
    return this.authResponse ? this.authResponse.token : undefined;
  }

  /**
   * Set the profile of the stylist. The stylist must be already authenticated as a user.
   * Existing limitation: does not work if the stylist profile already exists,
   * so this is a works-only-once type of call. I asked backend to change the behavior.
   */
  setStylistProfile(data: StylistProfile): Observable<ApiResponse<AuthResponse>> {
    return Observable.of({ response: { token: 'test-token', role: UserRole.stylist } });
  }
}
