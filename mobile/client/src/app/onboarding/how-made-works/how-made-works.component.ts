import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@IonicPage()
@Component({
  selector: 'page-how-made-works',
  templateUrl: 'how-made-works.component.html'
})
export class HowMadeWorksComponent {

  constructor(
    private navCtrl: NavController
  ) {
  }

  onContinue(): void {
    this.navCtrl.push(PageNames.HowPricingWorks);
  }
}
