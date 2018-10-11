import { Component, Input } from '@angular/core';
import { getPrice } from '~/shared/pipes/price.pipe';

@Component({
  selector: 'regular-price',
  templateUrl: 'regular-price.component.html'
})
export class RegularPriceComponent {
  @Input() regularPrice: number;
  @Input() price?: number;

  getPrice(price: number) {
    return getPrice(price.toString());
  }
}
