import { Component, EventEmitter, Input, Output } from '@angular/core';

import { WeekdayDiscount } from '~/core/api/discounts.models';

@Component({
  selector: 'discounts-revisit-short',
  templateUrl: 'discounts-revisit-short.component.html'
})
export class DiscountsRevisitShortComponent {
  @Input() discounts: WeekdayDiscount[];
  @Output() revisitChange = new EventEmitter();

  protected onDiscountChange(): void {
    this.revisitChange.emit();
  }
}
