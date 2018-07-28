import { CountryCode, formatNumber, parseNumber } from 'libphonenumber-js';

/**
 * Validate and format a phone number string as a number in default country
 * or as international number and returns details of parsing.
 * If the number is valid returns it in normalized form.
 * @returns undefined if the phone number is not valid or a normalized phone number as
 *          a string formatted in Internatioal format
 */
export function normalizePhoneNumber(phone: string, defaultCountry: CountryCode): string | undefined {
  try {
    const intlFormat = formatNumber(parseNumber(phone, defaultCountry), 'International');

    // Due to a bug in libphonenum we need to parse again the resulting international format
    // to see if it is really a valid number.
    if (parseNumber(intlFormat, defaultCountry).phone) {
      return intlFormat;
    } else {
      return undefined;
    }
  } catch (e) {
    return undefined;
  }
}
