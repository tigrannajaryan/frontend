import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { WeekdayIso } from '~/shared/weekday';

import { WeekdayDiscount } from '~/core/api/discounts.models';
import { PercentageSliderSettings } from '~/core/popups/change-percent/change-percent.component';
import { dealOfTheWeekMinDiscount } from '~/shared/constants';
import { PageNames } from '~/core/page-names';
import { MadeDisableOnClick } from '~/shared/utils/loading';

export enum DiscountSymbol {
  percent = '%',
  dollar = '$'
}

@Component({
  selector: 'discounts-list',
  templateUrl: 'discounts-list.component.html'
})
export class DiscountsListComponent implements OnInit {
  @Input() list: WeekdayDiscount[];
  @Input() dealOfTheWeek: WeekdayIso;
  @Input() symbol: DiscountSymbol;
  @Input() errorMsg: string;
  @Output() discountChange = new EventEmitter();
  protected DiscountSymbol = DiscountSymbol;

  constructor(
    public modalCtrl: ModalController
    ) {
  }

  ngOnInit(): void {
    if (!this.symbol) {
      this.symbol = DiscountSymbol.percent;
    }
  }

  /**
   * Open modal where we can change percent of any item
   * @param index - if array of list
   */
  @MadeDisableOnClick
  async onDiscountChange(index: number): Promise<void> {
    let prevDiscountPercent: number;

    const discount: WeekdayDiscount = this.list[index];
    const prevDiscount: WeekdayDiscount = this.list[index - 1];

    if (this.errorMsg && prevDiscount) {
      prevDiscountPercent = prevDiscount.discount_percent;
    }

    const curWeekday: WeekdayDiscount = this.list[index];
    const data: PercentageSliderSettings = {
      label: curWeekday.weekday_verbose,
      percentage: curWeekday.discount_percent
    };

    if (discount && discount.weekday === this.dealOfTheWeek) {
      data.min = dealOfTheWeekMinDiscount;
    }

    if (this.errorMsg) {
      data.errorMsg = this.errorMsg;
      data.prevDiscountPercent = prevDiscountPercent;
    }

    const modal = this.modalCtrl.create(PageNames.ChangePercent, { data });
    modal.onDidDismiss((res: number) => {
      if (isNaN(res)) {
        return;
      }

      // if value changed
      if (this.list[index].discount_percent !== res) {
        this.list[index].discount_percent = res;
        this.discountChange.emit();
      }
    });
    await modal.present();
  }
}
