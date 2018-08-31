import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'welcome-to-made'
})
@Component({
  selector: 'page-welcome-to-made',
  templateUrl: 'welcome-to-made.component.html'
})
export class WelcomeToMadeComponent {
  protected PageNames = PageNames;

  constructor(private navCtrl: NavController) {}

  protected onContinue(): void {
    this.navCtrl.push(PageNames.HowPricingWorks);
  }
}
