declare const process: any; // make process variable visible to TypeScript

export function getBuildNumber(): string {
  return (process.env.IOS_BUILD_NUMBER  || '0').trim();
}
