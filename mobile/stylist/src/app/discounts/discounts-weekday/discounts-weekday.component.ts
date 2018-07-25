import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { loading } from '~/core/utils/loading';
import { PageNames } from '~/core/page-names';
import { Discounts, WeekdayDiscount } from '~/discounts/discounts.models';
import { DiscountsApi } from '~/discounts/discounts.api';

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

  constructor(
    private navCtrl: NavController,
    private discountsApi: DiscountsApi
  ) {
    this.loadInitialData();
  }

  @loading
  async loadInitialData(): Promise<void> {
    const discounts = await this.discountsApi.getDiscounts() as Discounts;
    this.discounts = discounts.weekdays.sort((a, b) => a.weekday - b.weekday); // from 1 (Monday) to 7 (Sunday)
  }

  protected onContinue(): void {
    this.navCtrl.push(PageNames.DiscountsRevisit);
  }

  protected onWeekdayChange(): void {
    this.discountsApi.setDiscounts({ weekdays: this.discounts });
  }
}
