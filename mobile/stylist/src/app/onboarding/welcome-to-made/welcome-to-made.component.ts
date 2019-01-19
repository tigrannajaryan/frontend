import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

export interface WelcomeToMadeComponentParams {
  isRootPage: boolean;
}

@Component({
  selector: 'page-welcome-to-made',
  templateUrl: 'welcome-to-made.component.html'
})
export class WelcomeToMadeComponent {
  PageNames = PageNames;
  params: WelcomeToMadeComponentParams;

  list = [
    'You set your services and full prices.',
    'You select your discounts.',
    'Your clients book.',
    'We track and steadily increase prices to full rate as your day fills up!'
  ];

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams
  ) {}

  ionViewWillLoad(): void {
    this.params = this.navParams.get('params') as WelcomeToMadeComponentParams;
  }

  onContinue(): void {
    this.navCtrl.push(PageNames.CalendarExample);
  }
}
