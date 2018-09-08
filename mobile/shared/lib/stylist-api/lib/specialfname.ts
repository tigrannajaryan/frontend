export function specialFunc(str: string): string {
  str = str;
  throw new Error('Not a real error, just for debugging from nested func');
  // return str;
}