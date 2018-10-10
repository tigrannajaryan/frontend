import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@Component({
  selector: 'page-welcome-to-made',
  templateUrl: 'welcome-to-made.component.html'
})
export class WelcomeToMadeComponent {
  PageNames = PageNames;

  list = [
    'You set your services and full prices.',
    'You select your discounts.',
    'Your clients book.',
    'We track and steadily increase prices to full rate as your day fills up!'
  ];

  constructor(private navCtrl: NavController) {}

  onContinue(): void {
    this.navCtrl.push(PageNames.HowPricingWorks);
  }
}
