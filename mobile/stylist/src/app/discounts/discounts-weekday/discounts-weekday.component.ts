import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Discounts, WeekdayDiscount } from '~/core/api/discounts.models';
import { DiscountsApi } from '~/core/api/discounts.api';
import { loading } from '~/shared/utils/loading';
import { PageNames } from '~/core/page-names';

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
    const discounts: Discounts = (await loading(this, this.discountsApi.getDiscounts())).response;
    if (discounts) {
      this.discounts = discounts.weekdays.sort((a, b) => a.weekday - b.weekday); // from 1 (Monday) to 7 (Sunday)
    }
  }

  protected async onContinue(): Promise<void> {
    // we need this call to set `has_weekday_discounts_set` to true
    // otherwise we will go to the discounts registration flow each time after log in
    const { response } = await this.discountsApi.setDiscounts({ weekdays: this.discounts }).get();
    if (response) {
      this.navCtrl.push(PageNames.DiscountsRevisit);
    }
  }

  protected async onWeekdayChange(): Promise<void> {
    await this.discountsApi.setDiscounts({ weekdays: this.discounts }).get();
  }
}
