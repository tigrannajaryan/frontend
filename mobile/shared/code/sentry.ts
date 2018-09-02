import * as Sentry from 'sentry-cordova';
import { ENV } from '../../environments/environment.default';

declare const process: any; // make process variable visible to TypeScript

export function initSentry(): void {
  const BUILD_NUMBER = (process.env.TRAVIS_BUILD_NUMBER  || '0').trim();
  const APP_BUNDLE_ID = process.env.IOS_APP_BUNDLE_ID;
  const APP_VERSION_NUMBER = process.env.APP_VERSION_NUMBER || '0.0.0';

  if (ENV.sentryDsn) {
    Sentry.init({ dsn: ENV.sentryDsn });
    // TODO: decide if it's iOS, Android or web - and use proper
    // TODO: bundle id of actual device
    const releaseId = `${APP_BUNDLE_ID}-${APP_VERSION_NUMBER}`;
    Sentry.setRelease(releaseId);
    Sentry.setDist(BUILD_NUMBER);
    Sentry.setExtraContext({ buildNum: BUILD_NUMBER });
  }
}

export function reportToSentry(error: any): void {
  try {
    Sentry.captureException(error.originalError || error);
  } catch (e) {
    console.error(e);
  }
}
