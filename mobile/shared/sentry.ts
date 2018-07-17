import * as Sentry from 'sentry-cordova';
import { ENV } from '../../environments/environment.default';

declare const process: any; // make process variable visible to TypeScript

export function initSentry(): void {
  const BUILD_NUMBER = (process.env.IOS_BUILD_NUMBER  || '0').trim();

  if (ENV.sentryDsn) {
    Sentry.init({ dsn: ENV.sentryDsn });
    Sentry.setExtraContext({ buildNum: BUILD_NUMBER });
  }
}
