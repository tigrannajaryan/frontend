import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(value: string): string {
    const price = parseInt(value, 10);
    if (Number.isNaN(price)) {
      return '';
    }
    return `$${price}`;
  }
}
