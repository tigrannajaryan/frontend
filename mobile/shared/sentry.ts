/*
Sentry is disabled for now because the iOS release is failing.
We will work on a fix later.
More details on the problem: https://github.com/madebeauty/monorepo/issues/316

import * as Sentry from 'sentry-cordova';
import { ENV } from '../../environments/environment.default';
import { getBuildNumber } from '~/core/functions';
*/

export function initSentry(): void {
/*
  if (ENV.sentryDsn) {
    Sentry.init({ dsn: ENV.sentryDsn });
    Sentry.setExtraContext({ buildNum: getBuildNumber() });
  }
*/
}
