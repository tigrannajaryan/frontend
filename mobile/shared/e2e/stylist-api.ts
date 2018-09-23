import * as fetch from 'node-fetch';
import { AuthCredentials, AuthResponse } from '../shared-app/stylist-api/auth-api-models';
import { InvitationsResponse, ClientInvitation } from '../shared-app/stylist-api/invitations.models';
import { StylistProfile } from '../shared-app/stylist-api/stylist-models';

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
  async registerByEmail(credentials: AuthCredentials): Promise<AuthResponse> {
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

  async post<ResponseType>(url: string, body: any): Promise<ResponseType> {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Token ${this.authToken}`;
    }

    const response = await fetch(`${apiURL}${url}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
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
