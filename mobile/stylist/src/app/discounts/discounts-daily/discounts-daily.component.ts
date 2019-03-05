import { Component } from '@angular/core';

import { Discounts, WeekdayDiscount } from '~/core/api/discounts.models';
import { DiscountsApi } from '~/core/api/discounts.api';
import { loading } from '~/shared/utils/loading';
import { PageNames } from '~/core/page-names';
import { DiscountsComponent } from '~/discounts/discounts.component';
import { WeekdayIso } from '~/shared/weekday';
import { ProfileDataStore } from '~/core/profile.data';

@Component({
  selector: 'page-discounts-daily',
  templateUrl: 'discounts-daily.component.html'
})
export class DiscountsDailyComponent {
  PageNames = PageNames;
  discounts: WeekdayDiscount[];
  dealOfTheWeek: WeekdayIso;
  isLoading = false;

  constructor(
    public profileData: ProfileDataStore,
    private discountsApi: DiscountsApi
  ) {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    const discounts: Discounts = (await loading(this, this.discountsApi.getDiscounts())).response;
    if (discounts) {
      this.discounts = DiscountsComponent.sortWeekdays(discounts.weekdays);
      this.dealOfTheWeek = discounts.deal_of_week_weekday;
    }
  }

  onSave(): void {
    this.discountsApi.setDiscounts({ weekdays: this.discounts }).get();
  }
}
