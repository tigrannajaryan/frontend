import { Injectable } from '@angular/core';

import { ENV } from '../../environments/environment.default';

const noop = (): any => undefined;

/**
 * A common logger that is used by the app.
 * TODO: properly handle multiple parameters to log() function.
 * TODO: think about how to get the logs in production environment.
 */
@Injectable()
export class Logger {

  private static invokeConsoleMethod(type: string, args?: any): void {
    // Don't log in production
    if (!ENV.production) {
      const logFn: Function = (console)[type] || console.log || noop;
      logFn.apply(console, args);
    }
  }

  info(...args: any[]): void {
    Logger.invokeConsoleMethod('info', args);
  }

  warn(...args: any[]): void {
    Logger.invokeConsoleMethod('warn', args);
  }

  error(...args: any[]): void {
    Logger.invokeConsoleMethod('error', args);
  }
}
