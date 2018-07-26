import { Component, EventEmitter, Input, Output } from '@angular/core';

import { WeekdayDiscount } from '~/core/api/discounts/discounts.models';

@Component({
  selector: 'discounts-weekday-short',
  templateUrl: 'discounts-weekday-short.component.html'
})
export class DiscountsWeekdayShortComponent {
  @Input() discounts: WeekdayDiscount[];
  @Output() weekdayChange = new EventEmitter();

  protected onDiscountChange(): void {
    this.weekdayChange.emit();
  }
}
