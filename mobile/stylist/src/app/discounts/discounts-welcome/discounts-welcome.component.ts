import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'discounts-welcome'
})
@Component({
  selector: 'page-discounts-welcome',
  templateUrl: 'discounts-welcome.component.html'
})
export class DiscountsWelcomeComponent {
  PageNames = PageNames;

  constructor(
    private navCtrl: NavController
  ) {
  }

  onContinue(): void {
    this.navCtrl.push(PageNames.Services);
  }
}
