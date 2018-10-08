import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber, ParsedNumber } from 'libphonenumber-js';
import { NumberFormat } from './phone-input.directive';

@Pipe({
    name: 'phone'
})
export class PhonePipe implements PipeTransform {

    transform(value: ParsedNumber, args?: string): any {
        if (!value) {
            return value;
        }
        return formatNumber(value, NumberFormat.International);
    }

}