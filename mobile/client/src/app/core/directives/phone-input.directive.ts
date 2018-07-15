import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { AsYouType, CountryCode, getCountryCallingCode, parseNumber } from 'libphonenumber-js';

export enum NumberFormat {
  National = 'National',
  International = 'International',
  E164 = 'E.164',
  RFC3966 = 'RFC3966',
  IDD = 'IDD'
}

enum SpecialKeysCodes {
  Backspace = 8,
  Space = 32,
  LeftArrow =  37,
  UpArrow =  38,
  RightArrow = 39,
  DownArrow =  40
}

export const DEFAULT_COUNTRY_CODE = 'US';

export function getUnifiedPhoneValue(phoneNumber: string, countryCode: CountryCode = DEFAULT_COUNTRY_CODE): string {
  const countryCallingCode = getCountryCallingCode(countryCode);
  const { phone } = parseNumber(phoneNumber, countryCode);
  return `+${countryCallingCode}${phone}`;
}

@Directive({
  selector: '[madePhoneInput]'
})
export class PhoneInputDirective {
  @Input() countryCode: CountryCode = DEFAULT_COUNTRY_CODE;

  constructor(
    private el: ElementRef
  ) {
  }

  @HostListener('keydown', [ '$event' ])
  keydown(event: KeyboardEvent): void {
    const code: number = event.which || Number(event.code);
    const key: string = event.key || String.fromCharCode(code);

    const isNotSpecialKey = !(code in SpecialKeysCodes);
    const isNotNumber = isNaN(parseInt(key, 10));

    if (isNotSpecialKey && isNotNumber) {
      event.preventDefault();
      return;
    }
  }

  @HostListener('keyup')
  keyup(): void {
    this.format();
  }

  @HostListener('ionBlur')
  blur(): void {
    this.format();
  }

  private format(): void {
    const input = this.el.nativeElement.querySelector('input');
    const cursorPosition = input.selectionStart;
    const cursorPositionInTheEnd = input.value.length;

    let formatted = new AsYouType(this.countryCode).input(input.value);
    // remove ”(” and ”)” because it leads to more complicated cursor restore
    formatted = formatted.replace(/[^\d\-\s]/g, '').trim();

    input.value = formatted;

    if (cursorPosition < cursorPositionInTheEnd) {
      // restore cursor
      input.selectionStart = input.selectionEnd = cursorPosition;
    }
  }
}
