import { Component } from '@angular/core';

import { MaximumDiscounts, MaximumDiscountsWithVars, WeekdayDiscount } from '~/core/api/discounts.models';
import { DiscountsApi } from '~/core/api/discounts.api';
import { PageNames } from '~/core/page-names';
import { ModalController } from 'ionic-angular';
import { ChangePercentSymbols, PercentageSliderSettings } from '~/core/popups/change-percent/change-percent.component';

enum DefaultUsdSliderSettings {
  min = 20,
  max = 250,
  step = 5
}

@Component({
  selector: 'page-discounts-maximum',
  templateUrl: 'discounts-maximum.component.html'
})
export class DiscountsMaximumComponent {
  protected PageNames = PageNames;
  protected discounts: WeekdayDiscount[];
  maximumDiscounts: MaximumDiscountsWithVars = {
    is_maximum_discount_label: 'Enable Maximum Discount',
    maximum_discount_label: 'Maximum Discount',
    maximum_discount: 0,
    is_maximum_discount_enabled: false
  };
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private discountsApi: DiscountsApi
  ) {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    const maximumDiscounts: MaximumDiscounts = (await this.discountsApi.getMaximumDiscounts().get()).response;
    if (maximumDiscounts) {
      this.maximumDiscounts.maximum_discount = maximumDiscounts.maximum_discount;
      this.maximumDiscounts.is_maximum_discount_enabled = maximumDiscounts.is_maximum_discount_enabled;
    }
  }

  onDiscountChange(): void {
    const percentage = this.maximumDiscounts.maximum_discount && this.maximumDiscounts.maximum_discount > DefaultUsdSliderSettings.min ?
      this.maximumDiscounts.maximum_discount : DefaultUsdSliderSettings.min;

    const data: PercentageSliderSettings = {
      label: this.maximumDiscounts.maximum_discount_label,
      percentage,
      symbol: ChangePercentSymbols.usd,
      min: DefaultUsdSliderSettings.min,
      max: DefaultUsdSliderSettings.max,
      step: DefaultUsdSliderSettings.step
    };

    const modal = this.modalCtrl.create(PageNames.ChangePercent, { data });
    modal.onDidDismiss((res: number) => {
      if (isNaN(res)) {
        return;
      }

      if (this.maximumDiscounts.maximum_discount !== res) {
        this.maximumDiscounts.maximum_discount = res;
        this.onSave();
      }
    });
    modal.present();
  }

  onSave(): void {
    this.discountsApi.setMaximumDiscounts({
      maximum_discount: this.maximumDiscounts.maximum_discount,
      is_maximum_discount_enabled: this.maximumDiscounts.is_maximum_discount_enabled
    }).get();
  }
}
