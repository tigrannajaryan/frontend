import { Injectable } from '@angular/core';

import { reportToSentry } from '~/shared/sentry';

// All interfaces added based on https://github.com/apache/cordova-plugin-inappbrowser/blob/master/types/index.d.ts
type channel = 'loadstart' | 'loadstop' | 'loaderror' | 'exit';

interface InAppBrowserEvent extends Event {
  /** the eventname, either loadstart, loadstop, loaderror, or exit. */
  type: channel;
  /** the URL that was loaded. */
  url: string;
  /** the error code, only in the case of loaderror. */
  code: number;
  /** the error message, only in the case of loaderror. */
  message: string;
}

interface BrowserWindow {
  /**
   * Adds a listener for an event from the InAppBrowser.
   * @param type      loadstart: event fires when the InAppBrowser starts to load a URL.
   *                  loadstop: event fires when the InAppBrowser finishes loading a URL.
   *                  loaderror: event fires when the InAppBrowser encounters an error when loading a URL.
   *                  exit: event fires when the InAppBrowser window is closed.
   * @param callback  the function that executes when the event fires. The function is
   *                  passed an InAppBrowserEvent object as a parameter.
   */
  addEventListener(eventType: channel, callback: (event: InAppBrowserEvent) => void | Promise<void>): void;

  /** Closes the InAppBrowser window. */
  close(): void;
}

/**
 * The object returned from a call to window.open.
 * NOTE: The InAppBrowser window behaves like a standard web browser, and can't access Cordova APIs.
 */
interface InAppBrowser {
  open(url: string, target?: string, options?: string, replace?: boolean): BrowserWindow;
}

@Injectable()
export class InstagramOAuthService {
  static baseUrl = 'https://api.instagram.com/oauth/authorize/';

  /**
   * This url can be whatever you like. In fact, a user won’t be redirected to it.
   * We handle a redirect on load start.
   *
   * NOTE: this url should be listed in ”Valid redirect URIs” section of your instagram client,
   *       check https://www.instagram.com/developer/clients/.
   */
  static redirectTo = 'https://madebeauty.com/';

  /**
   * Instagram’s OAuth implementation:
   * 1. open a browser page with redirect uri and basic scope params,
   * 2. wait for user to pass instagram’s registration,
   * 3. when redirected back (handled in loadstart) retrieve the token value.
   *
   * This is known as Client-Side (Implicit) Authentication which can be found
   * in https://www.instagram.com/developer/authentication/ guide.
   *
   * NOTE: the OAuth used here (basic scope) will be deprecated/disabled in early 2020.
   */
  auth(clientId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const url =
        `${InstagramOAuthService.baseUrl}?client_id=${clientId}&redirect_uri=${InstagramOAuthService.redirectTo}&response_type=token`;
      const browserWindow: BrowserWindow = this.openBrowserWindow(url);

      browserWindow.addEventListener('loadstart', event => {

        // If the url starts with redirectTo url it means that authentication flow is finished at Instagram
        // and Instagram redirected to our url and the access token is expected to be in the url.
        if (event.url.indexOf(InstagramOAuthService.redirectTo) === 0) {
          browserWindow.close();

          const token = event.url.match(/access_token=([\w|\.]+)/);
          if (token && token[1]) {
            resolve(token[1].toString());
          } else {
            const error = new Error(`cannot retrieve Instagram access token from ${event.url}`);
            reportToSentry(error);
            reject(error);
          }
        }
      });

      browserWindow.addEventListener('loaderror', event => {
        const error = new Error(`${event.code} error for ${event.url}, ${event.message}`);
        reportToSentry(error);
        reject(error);
      });

      browserWindow.addEventListener('exit', () => {
        reject(new Error('user refused to log in'));
      });
    });
  }

  /**
   * Show a popup with browser page without leaving the application.
   *
   * NOTE: we are using cordova.InAppBrowser.open as far is this is the only way
   *       to show a new page in browser popup inside the application. Ionic’s
   *       InAppBrowser doesn’t work properly.
   */
  private openBrowserWindow = (url: string): BrowserWindow => {
    const { cordova } = window as any;
    if (!cordova) {
      throw new Error('cordova not available');
    }
    return (cordova.InAppBrowser as InAppBrowser).open(
      url, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes,closebuttoncaption=Cancel'
    );
  };
}
