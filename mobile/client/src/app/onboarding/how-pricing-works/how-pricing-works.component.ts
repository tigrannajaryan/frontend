import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ClientStartupNavigation } from '~/core/client-startup-navigation';

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
    private navParams: NavParams
  ) {
    this.hideContinueButton = this.navParams.get('hideContinueButton') as boolean;
  }

  async onContinue(): Promise<void> {
    await this.clientNavigation.showAfterHowPricingWorks(this.navCtrl);
  }
}
