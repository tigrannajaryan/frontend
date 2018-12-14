import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';

import { DayOffer, ServiceModel } from '~/shared/api/price.models';
import { StylistProfileName } from '~/shared/api/stylist-app.models';

import { ProfileModel } from '~/core/api/profile.models';
import { ClientStartupNavigation } from '~/core/client-startup-navigation';

import { ProfileDataStore } from '~/profile/profile.data';

// Some nice looking fake prices
const fakePrices = [
  200, 200, 200, undefined,
  200, 170, 160, 190, 190, 200, undefined,
  190, 185, 160, 190, 200, 200, 200,
  200, 170, undefined, 200, 200, undefined, 200,
  200, 185, 170
];

@Component({
  selector: 'page-how-pricing-works',
  templateUrl: 'how-pricing-works.component.html'
})
export class HowPricingWorksComponent {
  hideContinueButton: boolean;
  regularPrice = 200;

  // Fake profile and services
  profile: StylistProfileName = {
    first_name: 'Sarah',
    last_name: 'Johnson'
  };
  services: ServiceModel[] = [{
    uuid: undefined,
    name: 'Color Correction',
    base_price: this.regularPrice
  }];

  prices: DayOffer[] = [];

  constructor(
    private clientNavigation: ClientStartupNavigation,
    private navCtrl: NavController,
    private navParams: NavParams,
    private profileDataStore: ProfileDataStore
  ) {
    // Generate offers starting from today using fake prices
    for (let i = 0; i < fakePrices.length; i++) {
      this.prices.push({
        date: moment().add(i, 'days').format('YYYY-MM-DD'),
        price: fakePrices[i],
        is_fully_booked: fakePrices[i] === undefined,
        is_working_day: fakePrices[i] !== undefined
      });
    }
  }

  ionViewWillEnter(): void {
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
