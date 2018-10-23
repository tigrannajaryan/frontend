import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

import { StylistPageParams } from '~/stylists/stylist/stylist.component';

@Component({
  selector: 'page-how-pricing-works',
  templateUrl: 'how-pricing-works.component.html'
})
export class HowPricingWorksComponent {
  hideContinueButton: boolean;

  list = [
    'Lower prices when you come more often—the most loyal clients see the lowest prices',
    'Lower prices on your stylist\'s slower days',
    'As appointment slots fill up discounts reduce, so book early!'
  ];

  constructor(
    private navCtrl: NavController,
    private preferredStylistsData: PreferredStylistsData,
    private navParams: NavParams
  ) {
    this.hideContinueButton = this.navParams.get('hideContinueButton') as boolean;
  }

  async onContinue(): Promise<void> {
    const preferredStylists = await this.preferredStylistsData.get();
    if (preferredStylists.length === 0) {
      const data: StylistPageParams = { onboarding: true };
      this.navCtrl.push(PageNames.Stylists, { data });
    } else {
      this.navCtrl.setRoot(PageNames.MainTabs);
    }
  }
}
