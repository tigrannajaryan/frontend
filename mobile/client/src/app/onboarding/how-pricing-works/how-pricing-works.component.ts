import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { PermissionScreenResult, PushNotification } from '~/shared/push/push-notification';
import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

import { StylistsPageParams } from '~/stylists/stylists-search/stylists-search.component';

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
    private navParams: NavParams,
    private preferredStylistsData: PreferredStylistsData,
    private pushNotification: PushNotification
  ) {
    this.hideContinueButton = this.navParams.get('hideContinueButton') as boolean;
  }

  async onContinue(): Promise<void> {
    // Show the permission asking screen if needed and wait until the user makes a choice
    if (await this.pushNotification.showPermissionScreen(false) === PermissionScreenResult.userWantsToGoBack) {
      // Back button was tapped on that screen. We are back to this screen, we should not continue.
      return;
    }

    const preferredStylists = await this.preferredStylistsData.get();
    if (preferredStylists.length === 0) {
      const data: StylistsPageParams = { onboarding: true };
      this.navCtrl.push(PageNames.Stylists, { data });
    } else {
      this.navCtrl.setRoot(PageNames.MainTabs);
    }
  }
}
