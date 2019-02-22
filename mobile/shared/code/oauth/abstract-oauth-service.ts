import { LoadingController } from 'ionic-angular';

import { reportToSentry } from '~/shared/sentry';

// All interfaces added based on https://github.com/apache/cordova-plugin-inappbrowser/blob/master/types/index.d.ts
type channel = 'loadstart' | 'loadstop' | 'loaderror' | 'exit';

export interface InAppBrowserEvent extends Event {
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

  /**
   * Can be used for showing hidden browser window.
   */
  show(): void;

  /**
   * Closes the InAppBrowser window.
   */
  close(): void;
}

/**
 * The object returned from a call to window.open.
 * NOTE: The InAppBrowser window behaves like a standard web browser, and can't access Cordova APIs.
 */
interface InAppBrowser {
  open(url: string, target?: string, options?: string, replace?: boolean): BrowserWindow;
}

/**
 * More verbose name to GET-request params hash.
 */
export interface GetParams {
  [name: string]: any;
}

export abstract class AbstractOAuthService {

  /**
   * Injected
   */
  protected loadingCtrl: LoadingController;

  /**
   * OAuth endpoint URL
   */
  protected baseUrl: string;

  /**
   * This url can be whatever you like. In fact, a user won’t be redirected to it.
   * We handle a redirect on load start.
   *
   * NOTE: this url should be listed in ”Valid redirect URIs” section of your instagram client,
   *       check https://www.instagram.com/developer/clients/.
   */
  protected redirectTo = 'https://madebeauty.com/';

  /**
   * The main method where
   * - await this.runOAuth(),
   * - handle OAuth results.
   */
  abstract auth(...args: any[]): any;

  /**
   * Common OAuth flow:
   * 1. open a browser page with redirect uri and some params,
   * 2. wait for user to pass registration,
   * 3. when redirected back (handled in loadstart) retrieve the token value.
   */
  protected runOAuth(params: GetParams): Promise<InAppBrowserEvent | Error> {
    return new Promise<InAppBrowserEvent | Error>((resolve, reject) => {

      // Android lacks of a loader indicator when page is loading.
      // Showing an Ionic’s one. Hides it when first page is loaded.
      const loader = this.loadingCtrl.create();
      loader.present();

      const requestParams =
        Object.keys(params)
          .map(key => `${key}=${params[key].toString()}`)
          .join('&');

      const url = `${this.baseUrl}?${requestParams}`;

      const browserWindow: BrowserWindow = this.openBrowserWindow(url);
      browserWindow.addEventListener('loadstart', (event: InAppBrowserEvent) => {

        // If the url starts with redirectTo url it means that authentication flow is finished
        // and we are redirected to our url and the access token is expected to be in the url.
        if (event.url.indexOf(this.redirectTo) === 0) {
          browserWindow.close();
          resolve(event);
        }
      });

      browserWindow.addEventListener('loadstop', () => {
        loader.dismiss();
        browserWindow.show();
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
      // TODO: fallback to browser tab
      throw new Error('cordova not available');
    }
    return (cordova.InAppBrowser as InAppBrowser).open(
      url, '_blank', 'location=no,hidden=yes,clearsessioncache=yes,clearcache=yes,closebuttoncaption=Cancel'
    );
  };
}
