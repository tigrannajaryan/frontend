import { Component, ViewChild } from '@angular/core';
import { Content, NavParams, Slides } from 'ionic-angular';

import { DiscountsApi } from '~/core/api/discounts.api';
import { Discounts, MaximumDiscounts, MaximumDiscountsWithVars, WeekdayDiscount } from '~/core/api/discounts.models';
import { PageNames } from '~/core/page-names';
import { loading } from '~/core/utils/loading';
import { FirstBooking } from '~/discounts/discounts-first-booking/discounts-first-booking.component';
import { DiscountsRevisitComponent } from '~/discounts/discounts-revisit/discounts-revisit.component';
import { getProfileStatus, updateProfileStatus } from '~/shared/storage/token-utils';
import { StylistProfileStatus } from '~/shared/api/stylist-app.models';
import { WeekdayIso } from '~/shared/weekday';

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
  @ViewChild(Slides) slides: Slides;
  PageNames = PageNames;
  DiscountTabNames = DiscountTabNames;
  weekdays: WeekdayDiscount[];
  rebook: WeekdayDiscount[];
  firstBooking: FirstBooking = {
    label: 'First booking',
    percentage: 0
  };
  maximumDiscounts: MaximumDiscountsWithVars = {
    is_maximum_discount_label: 'Enable Maximum Discount',
    maximum_discount_label: 'Maximum Discount',
    maximum_discount: 0,
    is_maximum_discount_enabled: false
  };
  dealOfTheWeek: WeekdayIso;
  discountTabs = [
    { name: 'Daily' },
    { name: 'Loyalty' },
    { name: 'First visit' },
    { name: 'Maximum' }
  ];
  activeTab: DiscountTabNames;
  params: DiscountsComponentParams;
  profileStatus: StylistProfileStatus;

  constructor(
    public navParams: NavParams,
    private discountsApi: DiscountsApi
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    this.params = this.navParams.get('params') as DiscountsComponentParams;
    await this.loadInitialData();
    await this.performInitialSaving(); // if needed
  }

  ionViewDidLoad(): void {
    this.activeTab = DiscountTabNames.weekday;
  }

  @loading
  async loadInitialData(): Promise<void> {
    const discounts: Discounts = (await this.discountsApi.getDiscounts().get()).response;
    if (!discounts) {
      return;
    }

    const { first_booking, weekdays, deal_of_week_weekday, ...rebook } = discounts;
    this.firstBooking.percentage = first_booking;
    this.weekdays = weekdays.sort((a, b) => a.weekday - b.weekday); // from 1 (Monday) to 7 (Sunday)
    this.weekdays.unshift(this.weekdays.pop()); // Sunday should be first
    this.dealOfTheWeek = deal_of_week_weekday;
    this.rebook = DiscountsRevisitComponent.transformRebookToDiscounts(rebook);

    const maximumDiscounts: MaximumDiscounts = (await this.discountsApi.getMaximumDiscounts().get()).response;
    if (maximumDiscounts) {
      this.maximumDiscounts.maximum_discount = maximumDiscounts.maximum_discount;
      this.maximumDiscounts.is_maximum_discount_enabled = maximumDiscounts.is_maximum_discount_enabled;
    }
  }

  async doRefresh(refresher): Promise<void> {
    await this.loadInitialData();

    refresher.complete();
  }

  changeTab(activeTab: DiscountTabNames): void {
    this.activeTab = activeTab;

    this.updateSlider(activeTab);
  }

  // swipe action for tabs
  onSlideChanged(): void {
    // if index more or equal to tabs length we got an error
    if (this.slides.getActiveIndex() >= this.discountTabs.length) {
      return;
    }
    this.activeTab = this.slides.getActiveIndex();
    this.updateSlider(this.activeTab);
  }

  updateSlider(activeTab: DiscountTabNames): void {
    const animationSpeedMs = 500;
    this.slides.slideTo(activeTab, animationSpeedMs);
    this.content.scrollToTop(animationSpeedMs);
  }

  onWeekdayChange(): void {
    this.discountsApi.setDiscounts({ weekdays: this.weekdays }).get();
  }

  async onUpdateWeekdayDiscounts(): Promise<void> {
    const discounts: Discounts = (await this.discountsApi.getDiscounts().get()).response;
    if (discounts) {
      this.weekdays = discounts.weekdays.sort((a, b) => a.weekday - b.weekday); // from 1 (Monday) to 7 (Sunday)
    }
  }

  onRevisitChange(): void {
    if (this.rebook) {
      this.discountsApi.setDiscounts(DiscountsRevisitComponent.transformDiscountsToRebook(this.rebook)).get();
    }
  }

  onFirstVisitChange(): void {
    this.discountsApi.setDiscounts({ first_booking: this.firstBooking.percentage }).get();
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
          ...DiscountsRevisitComponent.transformDiscountsToRebook(this.rebook),
          weekdays: this.weekdays,
          first_booking: this.firstBooking.percentage
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
