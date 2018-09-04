import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

@IonicPage()
@Component({
  selector: 'page-how-pricing-works',
  templateUrl: 'how-pricing-works.component.html'
})
export class HowPricingWorksComponent {

  constructor(
    private navCtrl: NavController,
    private preferredStylistsData: PreferredStylistsData
  ) {
  }

  async onContinue(): Promise<void> {
    const preferredStylists = await this.preferredStylistsData.get();
    if (preferredStylists.length === 0) {
      this.navCtrl.push(PageNames.Stylists, { continueText: 'Let‘s get started!' });
    } else {
      this.navCtrl.setRoot(PageNames.MainTabs);
    }
  }
}
