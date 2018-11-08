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
