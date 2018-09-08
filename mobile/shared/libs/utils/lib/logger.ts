import { Injectable } from '@angular/core';

/**
 * A common logger that is used by the app.
 */
@Injectable()
export class Logger {

  private static invokeConsoleMethod(type: string, ...args: any[]): void {
    // tslint:disable-next-line:no-console
    const logFn: Function = (console)[type] || console.log;
    logFn.apply(console, ...args);
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
