import * as Sentry from 'sentry-cordova';
import { ENV } from '../../environments/environment.default';
import { getBuildNumber } from '~/core/functions';

export function initSentry(): void {
  if (ENV.sentryDsn) {
    Sentry.init({ dsn: ENV.sentryDsn });
    Sentry.setExtraContext({ buildNum: getBuildNumber() });
  }
}
