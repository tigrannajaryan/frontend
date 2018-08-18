import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { loading } from '~/core/utils/loading';
import { Discounts } from '../discounts.models';
import { DiscountsApi } from '../discounts.api';

export interface FirstBooking {
  label: string;
  percentage: number;
}

@IonicPage({
  segment: 'discounts-first-booking'
})
@Component({
  selector: 'page-discounts-first-booking',
  templateUrl: 'discounts-first-booking.component.html'
})
export class DiscountsFirstBookingComponent {
  protected PageNames = PageNames;
  protected firstBooking: FirstBooking = {
    label: 'First booking',
    percentage: 0
  };

  constructor(
    private navCtrl: NavController,
    private discountsApi: DiscountsApi
  ) {
    this.loadInitialData();
  }

  @loading
  async loadInitialData(): Promise<void> {
    const discounts = await this.discountsApi.getDiscounts() as Discounts;
    this.firstBooking.percentage = discounts.first_booking;
  }

  protected onContinue(): void {
    this.navCtrl.push(PageNames.Invitations);
  }

  protected onFirstVisitChange(): void {
    this.discountsApi.setDiscounts({ first_booking: this.firstBooking.percentage });
  }
}
