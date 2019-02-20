import * as moment from 'moment';

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

/**
 * Set a/p format instead of am/pm for time formatting.
 */
moment.updateLocale('en', {
  meridiem: (hours, minutes, isLower) => {
    if (hours > 11) {
      return isLower ? 'p' : 'P';
    } else {
      return isLower ? 'a' : 'A';
    }
  }
});

/**
 * Format time that is in ISO 8601 format in the timezone that is specified in the input.
 * For example 2018-08-18T14:00:00-06:00 will return 2:00pm.
 */
export function formatTimeInZone(dt: moment.MomentInput): string {
  return moment.parseZone(dt).format('h:mma');
}

export function trimStr(s?: string): string {
  if (s) {
    return s.trim();
  }
  return s;
}

export function removeParamsFormUrl(url: string): string {
  if (
      url
      && url.match(/.*(?=\?)/)
      && url.match(/.*(?=\?)/)[0]
  ) {
    return url.match(/.*(?=\?)/)[0];
  }
  return url;
}
