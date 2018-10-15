import { Component, Input } from '@angular/core';
import { getPrice } from '~/shared/pipes/price.pipe';

@Component({
  selector: 'price-pair',
  templateUrl: 'price-pair.component.html'
})
export class PricePairComponent {
  @Input() regularPrice: number;
  @Input() clientPrice?: number;

  getPrice(price: number): string {
    return getPrice(price.toString());
  }
}
