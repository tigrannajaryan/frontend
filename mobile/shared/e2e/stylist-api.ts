import * as fetch from 'node-fetch';

import { EmailAuthCredentials, AuthResponse } from '../shared-app/api/auth.models';
import { InvitationsResponse, ClientInvitation } from '../shared-app/api/invitations.models';
import { Worktime } from '../shared-app/api/worktime.models';
import { SetStylistServicesParams, StylistProfile, StylistServicesListResponse } from '../shared-app/api/stylist-app.models';

// Get the right environment
const envName = process.env.MB_ENV ? process.env.MB_ENV : 'default';
const ENV = require(`../../src/app/environments/environment.${envName}`).ENV;

// Get the API url based on the backend url specified in the environment
const apiURL = `${ENV.apiUrl}`;

class StylistApi {
  private authToken: string;

  /**
   * Register a new user authenticate using the API. If successfull remembers the auth response
   * and token which can be later obtained via getAuthToken().
   */
  async registerByEmail(credentials: EmailAuthCredentials): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('auth/register', credentials);
    this.authToken = response.token;
    return response;
  }

  /**
   * Set the profile of the stylist. The stylist must be already authenticated as a user.
   */
  async setProfile(data: StylistProfile): Promise<StylistProfile> {
    return this.post<StylistProfile>('stylist/profile', data);
  }

  /**
   * Sends invitation(s) to the provided client(s). The stylist must be already authenticated as a user.
   */
  async createInvitations(data: ClientInvitation[]): Promise<InvitationsResponse> {
    return this.post<InvitationsResponse>('stylist/invitations', data);
  }

  /**
   * Get stylist services. The stylist must be already authenticated as a user.
   */
  getStylistServices(): Promise<StylistServicesListResponse> {
    return this.get<StylistServicesListResponse>('stylist/services');
  }

  /**
   * Set service to stylist. The stylist must be already authenticated as a user.
   */
  setStylistServices(data: SetStylistServicesParams): Promise<StylistServicesListResponse> {
    return this.post<StylistServicesListResponse>('stylist/services', data);
  }

  /**
   * Sets the working hours of the stylist. The stylist must be already authenticated as a user.
   */
  setWorktime(data: Worktime): Promise<Worktime> {
    return this.post<Worktime>('stylist/availability/weekdays', data.weekdays);
  }

  get<ResponseType>(url: string): Promise<ResponseType> {
    return this.request<ResponseType>('GET', url, undefined);
  }

  post<ResponseType>(url: string, body: any): Promise<ResponseType> {
    return this.request<ResponseType>('POST', url, body);
  }

  async request<ResponseType>(method: string, url: string, body: any): Promise<ResponseType> {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Token ${this.authToken}`;
    }

    const response = await fetch(`${apiURL}${url}`,
      {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

    if (response.status < 200 || response.status > 299) {
      let responseBody;
      try {
        responseBody = await response.text()
      } catch {
        // ignore decoding errors if any
      }

      throw Error(`Stylist API failed with HTTP Status: ${response.statusText} (${responseBody})`);
    }

    return await response.json();
  }
}

export const stylistApi = new StylistApi();
