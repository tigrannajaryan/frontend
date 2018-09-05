import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@IonicPage()
@Component({
  selector: 'page-how-made-works',
  templateUrl: 'how-made-works.component.html'
})
export class HowMadeWorksComponent {
  hideContinueButton: boolean;

  list = [
    'Book with your favorite hair stylist',
    'Choose your services',
    'Get a personalized calendar that automatically updates prices',
    'Select the time and the price that work best for you!'
  ];

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams
  ) {
    this.hideContinueButton = this.navParams.get('hideContinueButton') as boolean;
  }

  onContinue(): void {
    this.navCtrl.push(PageNames.HowPricingWorks);
  }
}
