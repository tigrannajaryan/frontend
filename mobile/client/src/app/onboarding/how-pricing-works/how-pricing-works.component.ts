import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ClientStartupNavigation } from '~/core/client-startup-navigation';
import { ProfileDataStore } from '~/profile/profile.data';
import { ProfileModel } from '~/core/api/profile.models';

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
    private clientNavigation: ClientStartupNavigation,
    private navCtrl: NavController,
    private navParams: NavParams,
    private profileDataStore: ProfileDataStore
  ) {
    this.hideContinueButton = this.navParams.get('hideContinueButton') as boolean;
  }

  async onContinue(): Promise<void> {
    // Remember that user saw educational screens
    const patchProfile: ProfileModel = { has_seen_educational_screens: true };
    await this.profileDataStore.set(patchProfile);

    // The profile is considered complete now. Continue to the appropriate screen.
    await this.clientNavigation.showNextForCompleteProfile(this.navCtrl);
  }
}
