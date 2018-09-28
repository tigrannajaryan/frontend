import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@Component({
  selector: 'page-how-pricing-works',
  templateUrl: 'how-pricing-works.component.html'
})
export class HowPricingWorksComponent {
  PageNames = PageNames;

  list = [
    'Visit more often',
    'Book earlier',
    'Book at off-peak times'
  ];

  constructor(
    private navCtrl: NavController
  ) {
  }

  onContinue(): void {
    this.navCtrl.push(PageNames.Services);
  }
}
