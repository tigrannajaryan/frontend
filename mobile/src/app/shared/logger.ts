import { Injectable } from '@angular/core';

import { ENV } from '../../environments/environment.default';

/**
 * A common logger that is used by the app.
 * TODO: properly handle multiple parameters to log() function.
 * TODO: think about how to get the logs in production environment.
 */
@Injectable()
export class Logger {
  /**
   * @param msg Log a message
   */
  log(msg: any): void {
    // Don't log in production
    if (!ENV.production) {
      // tslint:disable-next-line:no-console
      console.log(msg);
    }
  }

  /**
   * @param msg Log a message
   */
  error(msg: any): void {
    // Don't log in production
    if (!ENV.production) {
      // tslint:disable-next-line:no-console
      console.error(msg);
    }
  }
}
