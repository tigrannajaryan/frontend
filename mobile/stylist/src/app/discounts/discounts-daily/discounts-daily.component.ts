import { Component } from '@angular/core';

import { Discounts, WeekdayDiscount } from '~/core/api/discounts.models';
import { DiscountsApi } from '~/core/api/discounts.api';
import { loading } from '~/shared/utils/loading';
import { PageNames } from '~/core/page-names';
import { DiscountsComponent } from '~/discounts/discounts.component';
import { WeekdayIso } from '~/shared/weekday';
import { StylistProfile } from '~/shared/api/stylist-app.models';
import { ProfileDataStore } from '~/core/profile.data';

@Component({
  selector: 'page-discounts-daily',
  templateUrl: 'discounts-daily.component.html'
})
export class DiscountsDailyComponent {
  PageNames = PageNames;
  discounts: WeekdayDiscount[];
  dealOfTheWeek: WeekdayIso;
  isLoading = false;

  constructor(
    public profileData: ProfileDataStore,
    private discountsApi: DiscountsApi
  ) {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    const discounts: Discounts = (await loading(this, this.discountsApi.getDiscounts())).response;
    if (discounts) {
      this.discounts = DiscountsComponent.sortWeekdays(discounts.weekdays);
      this.dealOfTheWeek = discounts.deal_of_week_weekday;

      this.performInitialSaving();
    }
  }

  onSave(): void {
    this.discountsApi.setDiscounts({ weekdays: this.discounts }).get();
  }

  private async performInitialSaving(): Promise<void> {
    let profile: StylistProfile;
    const { response } = await this.profileData.get();
    if (response) {
      profile = response;
    }

    if (profile && profile.profile_status && !profile.profile_status.has_weekday_discounts_set) {
      // Perform initial saving of the discounts and mark them checked.
      await this.discountsApi.setDiscounts({ weekdays: this.discounts }).toPromise();
    }
  }
}
