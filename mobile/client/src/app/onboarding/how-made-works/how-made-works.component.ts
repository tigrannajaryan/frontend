import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@Component({
  selector: 'page-how-made-works',
  templateUrl: 'how-made-works.component.html'
})
export class HowMadeWorksComponent {
  hideContinueButton: boolean;

  list = [
    'Book with your favorite hair stylist',
    'Choose your services',
    'Pick from multiple price options that update automatically',
    'Select the price and time that works best for you!'
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
