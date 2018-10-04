/**
 * Generates normalized not existed phone number
 */
export function randomPhone(): string {
  return `+1555${Math.random().toFixed(9).toString().slice(2, 9)}`;
}

/**
 * Replaces all &nbsp; in text with spaces
 * (note: \u00a0 represents &nbsp;)
 */
export function replaceNbspWithSpaces(text: string): string {
  return text.replace(/\u00a0/g, ' ');
}
