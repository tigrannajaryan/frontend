import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { Discounts, WeekdayDiscount } from '~/shared/stylist-api/discounts.models';
import { DiscountsApi } from '~/shared/stylist-api/discounts.api';
import { loading } from '~/shared/utils/loading';
import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'discounts-weekday'
})
@Component({
  selector: 'page-discounts-weekday',
  templateUrl: 'discounts-weekday.component.html'
})
export class DiscountsWeekdayComponent {
  protected PageNames = PageNames;
  protected discounts: WeekdayDiscount[];
  isLoading = false;

  constructor(
    private navCtrl: NavController,
    private discountsApi: DiscountsApi
  ) {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    const discounts: Discounts = await loading(this, this.discountsApi.getDiscounts());
    this.discounts = discounts.weekdays.sort((a, b) => a.weekday - b.weekday); // from 1 (Monday) to 7 (Sunday)
  }

  protected onContinue(): void {
    // we need this call to set `has_weekday_discounts_set` to true
    // otherwise we will go to the discounts registration flow each time after log in
    this.discountsApi.setDiscounts({ weekdays: this.discounts });
    this.navCtrl.push(PageNames.DiscountsRevisit);
  }

  protected onWeekdayChange(): void {
    this.discountsApi.setDiscounts({ weekdays: this.discounts });
  }
}
