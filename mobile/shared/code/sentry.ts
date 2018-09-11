import * as Sentry from 'sentry-cordova';
import { Severity } from '@sentry/shim';

import { ENV } from '../../environments/environment.default';

declare const process: any; // make process variable visible to TypeScript

export function initSentry(): void {
  const BUILD_NUMBER = (process.env.TRAVIS_BUILD_NUMBER  || '0').trim();
  const APP_BUNDLE_ID = process.env.APP_BUNDLE_ID;
  const APP_VERSION_NUMBER = process.env.APP_VERSION_NUMBER || '0.0.0';

  if (ENV.sentryDsn) {
    Sentry.init({ dsn: ENV.sentryDsn });
    const releaseId = `${APP_BUNDLE_ID}-${APP_VERSION_NUMBER}`;
    Sentry.setRelease(releaseId);
    Sentry.setDist(BUILD_NUMBER);
    Sentry.setExtraContext({ buildNum: BUILD_NUMBER });
  }
}

export function reportToSentry(error: any, level: Severity = Severity.Error): void {
  try {
    // Sentry Cordova does not provide a way to set error severity level. The workaround
    // is to set a custom tag for severity and use it on Sentry side.
    Sentry.setTagsContext({ 'made.severity': level });
    Sentry.captureException(error.originalError || error);
  } catch (e) {
    console.error(e);
  }
}
