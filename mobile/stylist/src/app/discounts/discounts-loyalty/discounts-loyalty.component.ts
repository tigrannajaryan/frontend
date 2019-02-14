import { Component } from '@angular/core';

import { Discounts, WeekdayDiscount } from '~/core/api/discounts.models';
import { DiscountsApi } from '~/core/api/discounts.api';
import { loading } from '~/shared/utils/loading';
import { PageNames } from '~/core/page-names';

enum RebookWeek {
  num = 2,
  word = 3
}

@Component({
  selector: 'page-discounts-loyalty',
  templateUrl: 'discounts-loyalty.component.html'
})
export class DiscountsLoyaltyComponent {
  protected PageNames = PageNames;
  protected discounts: WeekdayDiscount[];
  isLoading = false;

  static transformRebookToDiscounts(discounts: Discounts): WeekdayDiscount[] {
    return Object.keys(discounts)
      .filter(key => key.match('rebook_within'))
      .map(key => {
        const keyStrings: string[] = key.split('_'); // key = `rebook_within_1_week`
        const weekdayIso = Number(keyStrings[RebookWeek.num]);
        return {
          weekday: weekdayIso,
          weekday_verbose: `${weekdayIso} ${keyStrings[RebookWeek.word]}`,
          discount_percent: discounts[key],
          is_working_day: true,
          is_deal_of_week: discounts.deal_of_week_weekday === weekdayIso
        };
      })
      .sort((a, b) => a.weekday - b.weekday); // from 1 (Monday) to 7 (Sunday)
  }

  static transformDiscountsToRebook(discounts: WeekdayDiscount[]): Discounts {
    return discounts.reduce((acc, cur) => {
      acc[`rebook_within_${cur.weekday_verbose.split(' ').join('_')}`] = cur.discount_percent;
      return acc;
    }, {});
  }

  constructor(
    private discountsApi: DiscountsApi
  ) {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    const discounts: Discounts = (await loading(this, this.discountsApi.getDiscounts())).response;
    if (discounts) {
      this.discounts = DiscountsLoyaltyComponent.transformRebookToDiscounts(discounts);
    }
  }

  onSave(): void {
    if (this.discounts) {
      this.discountsApi.setDiscounts(
        DiscountsLoyaltyComponent.transformDiscountsToRebook(this.discounts)).get();
    }
  }
}
