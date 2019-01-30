import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalController } from 'ionic-angular';
import * as moment from 'moment';

import { dealOfTheWeekMinDiscount } from '~/shared/constants';
import { StylistProfileStatus } from '~/shared/api/stylist-app.models';
import {
  ListPickerOption,
  ListPickerPopupComponent,
  ListPickerPopupParams
} from '~/shared/components/list-picker-popup/list-picker-popup.component';
import { updateProfileStatus } from '~/shared/storage/token-utils';
import { showAlert } from '~/shared/utils/alert';
import { WeekdayIso } from '~/shared/weekday';

import { DiscountsApi } from '~/core/api/discounts.api';
import { WeekdayDiscount } from '~/core/api/discounts.models';

@Component({
  selector: 'discounts-weekday-short',
  templateUrl: 'discounts-weekday-short.component.html'
})
export class DiscountsWeekdayShortComponent {
  moment = moment;

  @Input() profileStatus: StylistProfileStatus;
  @Input() discounts: WeekdayDiscount[];
  @Input() dealOfTheWeek: WeekdayIso;

  @Output() weekdayChange = new EventEmitter();
  @Output() updateWeekdayDiscounts = new EventEmitter();

  constructor(
    private discountsApi: DiscountsApi,
    private modalCtrl: ModalController
  ) {
  }

  selectDealOfTheWeek(): void {
    const params: ListPickerPopupParams = {
      options: moment.weekdays()
        .map(weekday => {
          const weekdayIso: WeekdayIso = moment().isoWeekday(weekday).isoWeekday() as WeekdayIso;
          return {
            label: weekday,
            value: weekdayIso,
            selected: this.dealOfTheWeek && this.dealOfTheWeek === weekdayIso
          };
        })
        .filter(option => {
          const weekday = this.discounts.find(discount => discount.weekday === option.value);
          return weekday && weekday.is_working_day;
        }),
      onSelect: async (option: ListPickerOption): Promise<void> => {
        if (option.value) {
          const oldValue = this.dealOfTheWeek;

          // Set new value
          this.dealOfTheWeek = option.value;

          // We will force the discount to be at least 30%
          const weekday = this.discounts.find(discount => discount.weekday === option.value);
          const modifiedWeekdays = weekday.discount_percent < dealOfTheWeekMinDiscount ? [{
              ...weekday,
              discount_percent: dealOfTheWeekMinDiscount
            }] : [];

          // Update on the server
          const { response } = await this.discountsApi.setDiscounts({
            deal_of_week_weekday: option.value,
            weekdays: modifiedWeekdays
          }).get();

          if (response) {
            this.updateWeekdayDiscounts.emit();

            // We want to show a message to the stylist explaining why we are changing to 30%
            if (modifiedWeekdays.length > 0) {
              showAlert('', 'Deal of the Week discount is 30% or more.');
            }

            await this.updateProfileStatus();
          } else {
            // Rollback to prev value in case of error
            this.dealOfTheWeek = oldValue;
          }
        }
      },
      title: 'Select Deal of the Week'
    };
    const popup = this.modalCtrl.create(ListPickerPopupComponent, { params });
    popup.present();
  }

  onDiscountChange(): void {
    this.weekdayChange.emit();
  }

  dealOfTheWeekSet(): boolean {
    return (
      this.dealOfTheWeek && this.discounts &&
      this.discounts.find(discount => discount.weekday === this.dealOfTheWeek).is_working_day
    );
  }

  private async updateProfileStatus(): Promise<void> {
    if (this.profileStatus && this.profileStatus.must_select_deal_of_week) {
      this.profileStatus = await updateProfileStatus({
        ...this.profileStatus,
        must_select_deal_of_week: false
      }) as StylistProfileStatus;
    }
  }
}
