import { Component } from '@angular/core';

import { Discounts, WeekdayDiscount } from '~/core/api/discounts.models';
import { DiscountsApi } from '~/core/api/discounts.api';
import { loading } from '~/shared/utils/loading';
import { PageNames } from '~/core/page-names';
import { PercentageSliderSettings } from '~/core/popups/change-percent/change-percent.component';
import { dealOfTheWeekMinDiscount } from '~/shared/constants';
import { ModalController, NavController } from 'ionic-angular';
import { WeekdayIso } from '~/shared/weekday';
import { getProfileStatus, updateProfileStatus } from '~/shared/storage/token-utils';
import { StylistProfileStatus } from '~/shared/api/stylist-app.models';
import { showAlert } from '~/shared/utils/alert';
import { WorkHoursComponentParams } from '~/workhours/workhours.component';
import { DiscountsComponent } from '~/discounts/discounts.component';

@Component({
  selector: 'page-discounts-deal',
  templateUrl: 'discounts-deal.component.html'
})
export class DiscountsDealComponent {
  PageNames = PageNames;
  dealOfTheWeekMinDiscount = dealOfTheWeekMinDiscount;
  newWeekDay: WeekdayDiscount;
  oldWeekDay: WeekdayDiscount;
  weekdays: WeekdayDiscount[];
  isLoading = false;

  static getDealOfTheWeekSet(dealOfTheWeek: WeekdayIso, weekdays: WeekdayDiscount[]): WeekdayDiscount {
    return (
      dealOfTheWeek
      && weekdays
      && weekdays.find(discount => discount.weekday === dealOfTheWeek).is_working_day
      && weekdays.find(discount => discount.weekday === dealOfTheWeek)
    );
  }

  static async updateProfileStatus(): Promise<void> {
    const profileStatus = await getProfileStatus() as StylistProfileStatus;

    if (profileStatus && profileStatus.must_select_deal_of_week) {
      await updateProfileStatus({
        ...profileStatus,
        must_select_deal_of_week: false
      });
    }
  }

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    private discountsApi: DiscountsApi
  ) {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    const discounts: Discounts = (await loading(this, this.discountsApi.getDiscounts())).response;
    if (discounts) {
      const { weekdays, deal_of_week_weekday } = discounts;

      this.weekdays = DiscountsComponent.sortWeekdays(weekdays);

      let dealOfWeek = deal_of_week_weekday;

      if (deal_of_week_weekday === 0) {
        // this is new user, without deal_of_week_weekday set
        const isWorkingDay: WeekdayDiscount = this.weekdays.find(discount => discount.is_working_day);
        dealOfWeek = isWorkingDay && isWorkingDay.weekday;
      }

      let weekday = DiscountsDealComponent.getDealOfTheWeekSet(dealOfWeek, weekdays);
      if (!weekday) {
        // dealOfWeek is not working day (is_working_day = false)
        const hasWorkingDay: WeekdayDiscount = this.weekdays.find(discount => discount.is_working_day);

        if (hasWorkingDay) {
          // set first working day (dealOfWeek is required)
          weekday = hasWorkingDay;
        } else {
          // all days is disabled (is_working_day: false)
          showAlert(
            'Set work hours before setting discounts.',
            '',
            [{
              text: 'Go to Hours',
              handler: () => {
                const params: WorkHoursComponentParams = {
                  isRootPage: true
                };

                this.navCtrl.setRoot(PageNames.WorkHours, { params });
              }
            }]
          );
          return;
        }
      }

      // dealOfWeek percent should be >= dealOfTheWeekMinDiscount
      weekday.discount_percent = weekday.discount_percent < dealOfTheWeekMinDiscount
        ? dealOfTheWeekMinDiscount : weekday.discount_percent;

      this.oldWeekDay = { ...weekday };
      this.newWeekDay = { ...weekday };
    }

    this.onSetDeal();
  }

  onSave(): void {
    this.discountsApi.setDiscounts({ weekdays: this.weekdays }).get();
  }

  onDealClick(item: WeekdayDiscount): void {
    const data: PercentageSliderSettings = {
      label: 'Deal of the Week Discount',
      percentage: item.discount_percent,
      min: dealOfTheWeekMinDiscount
    };

    const modal = this.modalCtrl.create(PageNames.ChangePercent, { data });
    modal.onDidDismiss(async (res: number) => {
      if (isNaN(res)) {
        return;
      }

      item.discount_percent = res;
    });
    modal.present();
  }

  onSelectWeekday($event: MouseEvent, weekday: WeekdayDiscount): void {
    $event.preventDefault();

    this.newWeekDay = weekday;

    this.onSetDeal();
  }

  async onSetDeal(): Promise<void> {
    const newWeekDay = {
      ...this.newWeekDay,
      discount_percent: this.oldWeekDay.discount_percent
    };

    // find and replace newWeekDay (deal of the week)
    // with current weekdays set
    const weekdays: WeekdayDiscount[] = this.weekdays.map((item: WeekdayDiscount) => {
      return item.weekday === newWeekDay.weekday ? newWeekDay : item;
    });

    // Update on the server
    const { response } = await this.discountsApi.setDiscounts({
      deal_of_week_weekday: newWeekDay.weekday,
      weekdays
    }).get();

    if (response) {
      this.weekdays = weekdays;
      this.oldWeekDay = newWeekDay;
      await DiscountsDealComponent.updateProfileStatus();
    }
  }
}
