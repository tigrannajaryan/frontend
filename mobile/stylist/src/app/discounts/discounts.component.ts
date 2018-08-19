import { Component, ViewChild } from '@angular/core';
import { Content, IonicPage, NavParams, Slides } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { loading } from '~/core/utils/loading';
import { Discounts, MaximumDiscounts, MaximumDiscountsWithVars, WeekdayDiscount } from '~/discounts/discounts.models';
import { DiscountsApi } from '~/discounts/discounts.api';
import { FirstBooking } from '~/discounts/discounts-first-booking/discounts-first-booking.component';
import { DiscountsRevisitComponent } from '~/discounts/discounts-revisit/discounts-revisit.component';

export enum DiscountTabNames {
  weekday,
  revisit,
  firstVisit,
  max
}

@IonicPage({
  segment: 'discounts'
})
@Component({
  selector: 'page-discounts',
  templateUrl: 'discounts.component.html'
})
export class DiscountsComponent {
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
  discountTabs = [
    {name: 'Daily'},
    {name: 'Loyalty'},
    {name: 'First visit'},
    {name: 'Maximum'}
  ];
  activeTab: DiscountTabNames;
  isProfile: Boolean;
  @ViewChild(Slides) slides: Slides;
  @ViewChild(Content) content: Content;

  constructor(
    public navParams: NavParams,
    private discountsApi: DiscountsApi
  ) {
  }

  ionViewDidLoad(): void {
    this.activeTab = DiscountTabNames.weekday;
  }

  ionViewWillEnter(): void {
    this.isProfile = Boolean(this.navParams.get('isProfile'));
    this.loadInitialData();
  }

  @loading
  async loadInitialData(): Promise<void> {
    const {first_booking, weekdays, ...rebook} = await this.discountsApi.getDiscounts() as Discounts;
    this.firstBooking.percentage = first_booking;
    this.weekdays = weekdays.sort((a, b) => a.weekday - b.weekday); // from 1 (Monday) to 7 (Sunday)
    this.rebook = DiscountsRevisitComponent.transformRebookToDiscounts(rebook);

    const maximumDiscounts = await this.discountsApi.getMaximumDiscounts() as MaximumDiscounts;
    this.maximumDiscounts.maximum_discount = maximumDiscounts.maximum_discount;
    this.maximumDiscounts.is_maximum_discount_enabled = maximumDiscounts.is_maximum_discount_enabled;
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
    this.discountsApi.setDiscounts({
      weekdays: this.weekdays
    });
  }

  onRevisitChange(): void {
    this.discountsApi.setDiscounts(DiscountsRevisitComponent.transformDiscountsToRebook(this.rebook));
  }

  onFirstVisitChange(): void {
    this.discountsApi.setDiscounts({
      first_booking: this.firstBooking.percentage
    });
  }

  onMaximumDiscountChange(): void {
    this.discountsApi.setMaximumDiscounts({
      maximum_discount: this.maximumDiscounts.maximum_discount,
      is_maximum_discount_enabled: this.maximumDiscounts.is_maximum_discount_enabled
    });
  }
}
