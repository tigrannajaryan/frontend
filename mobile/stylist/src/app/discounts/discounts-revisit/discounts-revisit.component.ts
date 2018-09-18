import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { Discounts, WeekdayDiscount } from '~/shared/stylist-api/discounts.models';
import { DiscountsApi } from '~/shared/stylist-api/discounts.api';
import { PageNames } from '~/core/page-names';
import { loading } from '~/core/utils/loading';

enum RebookWeek {
  num = 2,
  word = 3
}

@IonicPage({
  segment: 'discounts-revisit'
})
@Component({
  selector: 'page-discounts-revisit',
  templateUrl: 'discounts-revisit.component.html'
})
export class DiscountsRevisitComponent {
  protected PageNames = PageNames;
  protected discounts: WeekdayDiscount[];

  static transformRebookToDiscounts(discounts: Discounts): WeekdayDiscount[] {
    return Object.keys(discounts)
      .filter(key => key.match('rebook_within'))
      .map(key => {
        const keyStrings: string[] = key.split('_'); // key = `rebook_within_1_week`
        return {
          weekday: +keyStrings[RebookWeek.num],
          weekday_verbose: `${+keyStrings[RebookWeek.num]} ${keyStrings[RebookWeek.word]}`,
          discount_percent: discounts[key],
          is_working_day: true
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
    private navCtrl: NavController,
    private discountsApi: DiscountsApi
  ) {
    this.loadInitialData();
  }

  @loading
  async loadInitialData(): Promise<void> {
    const discounts = await this.discountsApi.getDiscounts() as Discounts;
    this.discounts = DiscountsRevisitComponent.transformRebookToDiscounts(discounts);
  }

  protected onContinue(): void {
    this.navCtrl.push(PageNames.DiscountsFirstBooking);
  }

  protected onRevisitChange(): void {
    this.discountsApi.setDiscounts(DiscountsRevisitComponent.transformDiscountsToRebook(this.discounts));
  }
}
