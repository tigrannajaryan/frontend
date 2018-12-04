import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import { GAEventCategory, GAWrapper } from '~/shared/google-analytics';
import { PageNames } from '~/core/page-names';
import { getPlatformName } from '~/shared/get-build-info';

@Component({
  selector: 'page-first-screen',
  templateUrl: 'first-screen.html'
})
export class FirstScreenComponent {
  constructor(
    private ga: GAWrapper,
    private navCtrl: NavController,
    private platform: Platform,
    private statusBar: StatusBar
  ) {
  }

  ionViewWillEnter(): void {
    this.statusBar.hide();

    // Send custom GA event and include platform name (needed for easier analytics)
    this.ga.trackEvent(GAEventCategory.openScreen, 'FirstScreen', getPlatformName(this.platform));
  }

  ionViewDidLeave(): void {
    this.statusBar.show();
  }

  login(): void {
    this.navCtrl.push(PageNames.Auth);
  }
}
