import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import { BaseServiceProvider } from '../base-service';
import { StylistProfile } from '../stylist-service/stylist-models';
import { PageNames } from '../../pages/page-names';
import { App } from 'ionic-angular';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface FbAuthCredentials {
  fbAccessToken: string;
  fbUserID: string;
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
 * AuthServiceProvider provides authentication against server API.
 */
@Injectable()
export class AuthServiceProvider extends BaseServiceProvider {

  private authResponse: AuthResponse;

  constructor(
    public http: HttpClient,
    public app: App
  ) {
    super(http);
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
   * Register a new user authenticate using the API. If successfull remembers the auth response
   * and token which can be later obtained via getAuthToken().
   */
  async loginByFb(credentials: FbAuthCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse>('auth/get-token-fb', credentials);
  }

  /**
   * Return token remembered after the last succesfull authentication.
   */
  getAuthToken(): string {
    return this.authResponse ? this.authResponse.token : undefined;
  }

  /**
   * Determines what page to show after auth based on the completeness
   * of the profile of the user.
   * @param profileStatus as returned by auth.
   */
  profileStatusToPage(profileStatus: StylistProfileStatus): void {
    /**
     * with this approach (PageNames.Today) we have = 'TodayComponent'
     * if TodayComponent wrapped with quotes then its lazy loadint and we need to add module for this component
     * otherwise we will get an error
     */
    let setPage: string;
    if (!profileStatus) {
      // No profile at all, start from beginning.
      setPage = PageNames.RegisterSalon;
    }
    if (!profileStatus.has_personal_data || !profileStatus.has_picture_set) {
      setPage = PageNames.RegisterSalon;
    }
    if (!profileStatus.has_services_set) {
      setPage = PageNames.RegisterServices;
    }

    // TODO: check the remaining has_ flags and return the appropriate
    // page name once the pages are implemented.

    // Everything is complete, go to Today screen.
    setPage = PageNames.Today;

    // Erase all previous navigation history and go the next
    // page that must be shown to this user.
    this.app.getActiveNav()
      .setRoot(setPage);
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

        return response;
      })
      .catch(e => {
        // Failed authentication. Clear previously saved successfull response (if any).
        this.authResponse = undefined;
        throw e;
      });
  }
}
