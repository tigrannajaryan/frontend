import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppStoreWebPage, PlatformNames } from '~/shared/constants';

import { PageNames } from '~/core/page-names';
import { ExternalAppService } from '~/shared/utils/external-app-service';

@Component({
  selector: 'page-first-screen',
  templateUrl: 'first-screen.html'
})
export class FirstScreenComponent {
  constructor(
    private external: ExternalAppService,
    private navCtrl: NavController,
    private platform: Platform,
    private statusBar: StatusBar
  ) {
  }

  ionViewWillEnter(): void {
    this.statusBar.hide();
  }

  ionViewDidLeave(): void {
    this.statusBar.show();
  }

  login(): void {
    this.navCtrl.push(PageNames.Auth);
  }

  openClientApp(): void {
    if (this.platform.is(PlatformNames.ios)) {
      this.external.openWebPage(AppStoreWebPage.iOSClient);
    } else {
      this.external.openWebPage(AppStoreWebPage.androidClient);
    }
  }
}
