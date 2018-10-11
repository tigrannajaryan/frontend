import { Pipe, PipeTransform } from '@angular/core';

export function getPrice(value: string) {
  const price = parseInt(value, 10);
  if (Number.isNaN(price)) {
    return '';
  }
  return `$${price}`;
}

@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(value: string): string {
    return getPrice(value);
  }
}
