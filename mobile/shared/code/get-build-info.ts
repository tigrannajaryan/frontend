import { Platform } from 'ionic-angular';

import { PlatformNames } from './constants';

declare const process: any; // make process variable visible to TypeScript

export function getBuildNumber(): string {
  return (process.env.TRAVIS_BUILD_NUMBER || '0').trim();
}

declare const __COMMIT_HASH__: string;

export function getCommitHash(): string {
  return __COMMIT_HASH__;
}

export function isDevelopmentBuild(): boolean {
  return !process.env.TRAVIS_BUILD_NUMBER;
}

export function getAppVersionNumber(): string {
    return process.env.APP_VERSION_NUMBER || '0.0.0';
}

export function getPlatformName(platform: Platform): PlatformNames {
  return platform.is(PlatformNames.ios) ? PlatformNames.ios : PlatformNames.android;
}
