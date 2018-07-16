import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from 'libphonenumber-js';

import { NumberFormat } from '~/core/directives/phone-input.directive';

@Pipe({ name: 'formatPhone' })
export class FormatPhonePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }
    return formatNumber(value, NumberFormat.International);
  }
}
