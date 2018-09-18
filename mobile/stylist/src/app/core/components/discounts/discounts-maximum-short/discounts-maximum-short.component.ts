import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { ChangePercentSymbols, PercentageSliderSettings } from '~/core/popups/change-percent/change-percent.component';
import { MaximumDiscountsWithVars } from '~/shared/stylist-api/discounts.models';

enum DefaultUsdSliderSettings {
  min = 20,
  max = 250,
  step = 5
}

@Component({
  selector: 'discounts-maximum-short',
  templateUrl: 'discounts-maximum-short.component.html'
})
export class DiscountsMaximumShortComponent {
  @Input() maximumDiscounts: MaximumDiscountsWithVars;
  @Output() maximumDiscountChange = new EventEmitter();

  constructor(
    private modalCtrl: ModalController
  ) {}

  protected onDiscountChange(): void {
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
        this.updateDiscount();
      }
    });
    modal.present();
  }

  protected updateDiscount(): void {
    this.maximumDiscountChange.emit();
  }
}
