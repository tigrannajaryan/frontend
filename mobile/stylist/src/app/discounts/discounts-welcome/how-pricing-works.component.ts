import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'how-pricing-works'
})
@Component({
  selector: 'page-how-pricing-works',
  templateUrl: 'how-pricing-works.component.html'
})
export class HowPricingWorksComponent {
  PageNames = PageNames;

  constructor(
    private navCtrl: NavController
  ) {
  }

  onContinue(): void {
    this.navCtrl.push(PageNames.Services);
  }
}
