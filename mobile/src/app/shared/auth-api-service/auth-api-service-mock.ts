import { Injectable } from '@angular/core';
import { AuthCredentials, AuthResponse, UserRole } from './auth-api-service';
import { StylistProfile } from '../stylist-service/stylist-models';

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
  async doAuth(credentials: AuthCredentials): Promise<AuthResponse> {
    if (credentials.email === this.successAuthCredentials.email &&
      credentials.password === this.successAuthCredentials.password) {
      this.authResponse = { token: 'test-token', role: UserRole.stylist};

      return Promise.resolve(this.authResponse);
    } else {
      throw new Error('authentication failed');
    }
  }

  /**
   * Register a new user authenticate using the API. If successfull remembers the auth response
   * and token which can be later obtained via getAuthToken().
   */
  async registerByEmail(credentials: AuthCredentials): Promise<AuthResponse> {
    this.authResponse = { token: 'test-token', role: UserRole.stylist };

    return Promise.resolve(this.authResponse);
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
  async setStylistProfile(data: StylistProfile): Promise<AuthResponse> {
    return Promise.resolve({ token: 'test-token', role: UserRole.stylist });
  }
}
