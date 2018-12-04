import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';

import { Logger } from '~/shared/logger';
import { reportToSentry } from '~/shared/sentry';

// Google OAuth login options:
export interface GoogleOAuthOptions {
  // To get a serverAuthCode, you must pass in your webClientId and set offline to true.
  // If offline is true, but no webClientId is provided, the serverAuthCode will NOT be requested.
  webClientId?: string;
  offline?: boolean;
  // Space-separated list of scopes. Always includes `profile` and `email`.
  scopes?: string;
}

// API OAuth scopes that you might need to request to access Google APIs, depending on the level of access you need.
// For more see https://developers.google.com/identity/protocols/googlescopes.
// Add the scopes you need below:
export enum GoogleOAuthScope {
  CalendarEvents = 'https://www.googleapis.com/auth/calendar.events'
}

export interface GoogleOAuthResponse {
  // User data:
  userId: string;
  displayName: string;
  givenName: string;
  familyName: string;
  imageUrl: string;
  email: string;
  // Tokens:
  idToken: string;
  accessToken: string;
  refreshToken: string;
  serverAuthCode: string;
}

// Error code returned on Android when DENY button is tapped on the consent screen.
const userDeniedAccess = 12501;

// Shown when app is not correctly registered in Google Console / Firebase Console.
const googleSigninError = 12500;

@Injectable()
export class GoogleSignin {
  constructor(
    private googlePlus: GooglePlus,
    private logger: Logger,
    protected platform: Platform
  ) {
  }

  /**
   * This will clear the OAuth2 token, forget which account was used to login, and disconnect that account from the app.
   * This will require the user to allow the app access again next time they sign in.
   */
  async disconnect(): Promise<boolean> {
    try {
      await this.googlePlus.disconnect();
      return true;
    } catch (error) {
      this.logger.warn('GoogleSignin unable to disconnect.', error);
      reportToSentry(error);
      return false;
    }
  }

  /**
   * Show Google Signin window and get permissions for listed scopes.
   *
   * Basically we just need to know webClientId (which is application-specific) and scopes.
   *
   * The webClientId is used only to support serverAuthCode which allows to work
   * with the Google services from the backend.
   * NOTE: if you don’t need the backend support just omit webClientId.
   *
   * The webClientId should be set up in config.xml under cordova-plugin-googleplus:
   * | <variable name="WEB_APPLICATION_CLIENT_ID" value="…" />
   *
   * @returns GoogleOAuthResponse on success or undefined on failure
   */
  async login(webClientId?: string, scopes: GoogleOAuthScope[] = []): Promise<GoogleOAuthResponse> {
    this.logger.info('GoogleSignin begin login for scopes:', scopes);

    let options: GoogleOAuthOptions = {
      // Should be a space-separated list of scopes:
      scopes: scopes.join(' ')
    };

    if (webClientId) {
      // Indicate that we would like to get serverAuthCode:
      options = { ...options, webClientId, offline: true };
    }

    let response: GoogleOAuthResponse;

    try {
      // Check if the user is already signed in to the app and sign him in silently if he is:
      response = await this.googlePlus.trySilentLogin(options);
    } catch (error) {
      this.logger.error('GoogleSignin unable to login silently.', error);
    }

    this.logger.warn('GoogleSignin trying full login.');

    if (!response) {
      try {
        // Walk the user through the Google Auth process screens:
        response = await this.googlePlus.login(options);
      } catch (error) {
        this.logger.error('GoogleSignin unable to login', error);
        await this.processLoginError(error);
        return undefined;
      }
    }

    if (response) {
      if (!response.serverAuthCode) {
        // Login was successful, but we don't have a serverAuthCode
        // This can happen if this is not the first login attempt (only on iOS)
        // We will logout and login again, this normally helps.
        this.logger.warn('GoogleSignin logged in but serverAuthCode is missing, logging out to relogin again.');
        try {
          await this.googlePlus.logout();
          response = await this.googlePlus.login(options);
        } catch (error) {
          this.logger.warn('GoogleSignin unable to login', error);
          await this.processLoginError(error);
          return undefined;
        }
      }
    }

    if (!response || !response.serverAuthCode) {
      this.logger.error('GoogleSignin failed to login:', JSON.stringify(response));
    } else {
      this.logger.warn('GoogleSignin successfull:', JSON.stringify(response));
    }

    return response;
  }

  private processLoginError(error: any): void {
    const msg = error.toString();

    if (/^The user canceled the sign-in flow/.test(msg)) {
      // User canceled
      this.logger.warn('GoogleSignin user refused to log in.', error);

    } else if (/^The operation couldn’t be completed/.test(msg)) {
      // Might indicate missconfiguration
      this.logger.warn('GoogleSignin might not be properly configured.', error);
      reportToSentry(error);

    } else if (error === userDeniedAccess) {
      this.logger.warn('GoogleSignin: user denied access');
    } else if (error === googleSigninError) {
      this.logger.error(`GoogleSignin: error ${error}. ` +
        'Did you add signing certificate SHA-1 fingerprint for this app to Firebase console at ' +
        'https://console.firebase.google.com/u/0/project/made-staging/settings/general/ ?');
      reportToSentry(error);
    }
  }
}
