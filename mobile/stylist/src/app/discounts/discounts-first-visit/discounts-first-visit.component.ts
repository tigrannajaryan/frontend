import { Component } from '@angular/core';

import { Discounts } from '~/core/api/discounts.models';
import { DiscountsApi } from '~/core/api/discounts.api';
import { PageNames } from '~/core/page-names';
import { loading, MadeDisableOnClick } from '~/shared/utils/loading';
import { PercentageSliderSettings } from '~/core/popups/change-percent/change-percent.component';
import { ModalController } from 'ionic-angular';

export interface FirstBooking {
  label: string;
  percentage: number;
}

@Component({
  selector: 'page-discounts-first-visit',
  templateUrl: 'discounts-first-visit.component.html'
})
export class DiscountsFirstVisitComponent {
  protected PageNames = PageNames;
  protected firstBooking: FirstBooking = {
    label: 'First booking',
    percentage: 0
  };
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private discountsApi: DiscountsApi
  ) {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    const discounts: Discounts = (await loading(this, this.discountsApi.getDiscounts())).response;
    if (discounts) {
      this.firstBooking.percentage = discounts.first_booking;
    }
  }

  async onSave(): Promise<void> {
    await this.discountsApi.setDiscounts({ first_booking: this.firstBooking.percentage }).get();
  }

  @MadeDisableOnClick
  async onDiscountChange(): Promise<void> {
    const data: PercentageSliderSettings = this.firstBooking;

    const modal = this.modalCtrl.create(PageNames.ChangePercent, { data });
    modal.onDidDismiss(async (percent: number) => {
      if (isNaN(percent)) {
        return;
      }

      if (this.firstBooking.percentage !== percent) {
        this.firstBooking.percentage = percent;
        await this.onSave();
      }
    });
    await modal.present();
  }
}
