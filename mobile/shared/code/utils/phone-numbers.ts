import { CountryCode, formatNumber, parseNumber } from 'libphonenumber-js';
import { NumberFormat } from '~/shared/directives/phone-input.directive';

/**
 * Phone number formatting.
 * @param phone = string, example `+1 0000000000`, `0000000000`
 * @param format = NumberFormat enum, example `NumberFormat.National` `NumberFormat.International`
 * @returns formatted phone `(000) 000-0000` or with country code `+1 (000) 000-0000`
 *          depends of format param
 */
export function getPhoneNumber(phone: string, format: NumberFormat = NumberFormat.National): string {
  if (!phone) {
    return;
  }

  phone = formatNumber(phone, format);

  if (format === NumberFormat.International) {
    return phone;
  }

  if (/^\+1\s?/.test(phone)) { // US, Canada
    return phone.replace(/^\+1\s?/, '').replace(/\s/g, '-');
  }
  return phone;
}

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
