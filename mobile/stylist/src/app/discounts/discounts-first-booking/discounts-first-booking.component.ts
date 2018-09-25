import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { Discounts } from '~/shared/stylist-api/discounts.models';
import { DiscountsApi } from '~/shared/stylist-api/discounts.api';
import { PageNames } from '~/core/page-names';
import { loading } from '~/shared/utils/loading';

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
  isLoading = false;

  constructor(
    private navCtrl: NavController,
    private discountsApi: DiscountsApi
  ) {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    const discounts: Discounts = await loading(this, this.discountsApi.getDiscounts());
    this.firstBooking.percentage = discounts.first_booking;
  }

  protected onContinue(): void {
    this.navCtrl.push(PageNames.Invitations);
  }

  protected onFirstVisitChange(): void {
    this.discountsApi.setDiscounts({ first_booking: this.firstBooking.percentage });
  }
}
