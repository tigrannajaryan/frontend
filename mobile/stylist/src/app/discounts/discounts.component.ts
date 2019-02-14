import { Component, ViewChild } from '@angular/core';
import { Content, NavController, NavParams } from 'ionic-angular';

import { DiscountsApi } from '~/core/api/discounts.api';
import { Discounts, MaximumDiscounts, WeekdayDiscount } from '~/core/api/discounts.models';
import { PageNames } from '~/core/page-names';
import { loading } from '~/core/utils/loading';
import { DiscountsLoyaltyComponent } from '~/discounts/discounts-loyalty/discounts-loyalty.component';
import { getProfileStatus, updateProfileStatus } from '~/shared/storage/token-utils';
import { StylistProfileStatus } from '~/shared/api/stylist-app.models';
import { WEEKDAY_SHORT_NAMES, WeekdayIso } from '~/shared/weekday';
import { Page } from 'ionic-angular/navigation/nav-util';
import { DiscountsDealComponent } from '~/discounts/discounts-deal/discounts-deal.component';

export enum DiscountTabNames {
  weekday,
  revisit,
  firstVisit,
  max
}

export interface DiscountsComponentParams {
  isRootPage?: boolean;
}

@Component({
  selector: 'page-discounts',
  templateUrl: 'discounts.component.html'
})
export class DiscountsComponent {
  @ViewChild(Content) content: Content;
  PageNames = PageNames;
  WEEKDAY_SHORT_NAMES = WEEKDAY_SHORT_NAMES;
  weekdays: WeekdayDiscount[];
  rebook: WeekdayDiscount[];
  firstVisit = 0;
  maximumDiscounts: MaximumDiscounts = {
    maximum_discount: 0,
    is_maximum_discount_enabled: false
  };
  dealOfTheWeek: WeekdayIso;
  params: DiscountsComponentParams;
  profileStatus: StylistProfileStatus;
  selectedWeekDay: WeekdayDiscount;

  static sortWeekdays(weekdays: WeekdayDiscount[]): WeekdayDiscount[] {
    weekdays = weekdays.sort((a, b) => a.weekday - b.weekday); // from 1 (Monday) to 7 (Sunday)
    weekdays.unshift(weekdays.pop()); // Sunday should be first
    return weekdays;
  }

  constructor(
    public navParams: NavParams,
    private navCtrl: NavController,
    private discountsApi: DiscountsApi
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.params = this.navParams.get('params') as DiscountsComponentParams;
    await this.loadInitialData();
    await this.performInitialSaving(); // if needed
  }

  @loading
  async loadInitialData(): Promise<void> {
    const discounts: Discounts = (await this.discountsApi.getDiscounts().get()).response;
    if (!discounts) {
      return;
    }

    // debugger;

    const { first_booking, weekdays, deal_of_week_weekday, ...rebook } = discounts;
    this.firstVisit = first_booking;
    this.weekdays = DiscountsComponent.sortWeekdays(weekdays);
    this.rebook = DiscountsLoyaltyComponent.transformRebookToDiscounts(rebook);

    const weekday = DiscountsDealComponent.getDealOfTheWeekSet(deal_of_week_weekday, weekdays);
    if (weekday) {
      this.selectedWeekDay = weekday;
    }

    const maximumDiscounts: MaximumDiscounts = (await this.discountsApi.getMaximumDiscounts().get()).response;
    if (maximumDiscounts) {
      this.maximumDiscounts.maximum_discount = maximumDiscounts.maximum_discount;
      this.maximumDiscounts.is_maximum_discount_enabled = maximumDiscounts.is_maximum_discount_enabled;
    }
  }

  openDiscountPage(page: Page): void {
    this.navCtrl.push(page);
  }

  async doRefresh(refresher): Promise<void> {
    await this.loadInitialData();

    refresher.complete();
  }

  onWeekdayChange(): void {
    this.discountsApi.setDiscounts({ weekdays: this.weekdays }).get();
  }

  async onUpdateWeekdayDiscounts(): Promise<void> {
    const discounts: Discounts = (await this.discountsApi.getDiscounts().get()).response;
    if (discounts) {
      this.weekdays = DiscountsComponent.sortWeekdays(discounts.weekdays);
    }
  }

  onRevisitChange(): void {
    if (this.rebook) {
      this.discountsApi.setDiscounts(DiscountsLoyaltyComponent.transformDiscountsToRebook(this.rebook)).get();
    }
  }

  onFirstVisitChange(): void {
    this.discountsApi.setDiscounts({ first_booking: this.firstVisit }).get();
  }

  onMaximumDiscountChange(): void {
    this.discountsApi.setMaximumDiscounts({
      maximum_discount: this.maximumDiscounts.maximum_discount,
      is_maximum_discount_enabled: this.maximumDiscounts.is_maximum_discount_enabled
    }).get();
  }

  private async performInitialSaving(): Promise<void> {
    this.profileStatus = await getProfileStatus() as StylistProfileStatus;
    if (this.profileStatus && !this.profileStatus.has_weekday_discounts_set && this.rebook) {
      // Perform initial saving of the discounts and mark them checked.
      const responses = await Promise.all([
        this.discountsApi.setDiscounts({
          ...DiscountsLoyaltyComponent.transformDiscountsToRebook(this.rebook),
          weekdays: this.weekdays,
          first_booking: this.firstVisit
        }).first().toPromise(),
        this.discountsApi.setMaximumDiscounts({
          maximum_discount: this.maximumDiscounts.maximum_discount,
          is_maximum_discount_enabled: this.maximumDiscounts.is_maximum_discount_enabled
        }).first().toPromise()
      ]);
      // If succeded and return no errors mark discounts checked.
      if (responses.every(({ error }) => !error)) {
        this.profileStatus = await updateProfileStatus({
          ...this.profileStatus,
          has_weekday_discounts_set: true
        }) as StylistProfileStatus;
      }
    }
  }
}
