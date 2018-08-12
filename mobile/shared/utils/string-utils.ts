/**
 * Simple string formatting function. Substitutes parameters in the
 * form {d} by correspoding item in args array.
 * @param str the format string
 * @param args the substitution values
 */
export function formatStr(str: string, ...args: any[]): string {
  return str.replace(/{(\d+)}/g, (match, num) => {
    num = parseInt(num, 10);
    return args[num] !== undefined ? args[num] : match;
  });
}

export function capitalizeFirstChar(str: string): string {
  if (str.length === 0) {
    return str;
  }
  return str[0].toLocaleUpperCase() + str.substring(1);
}
