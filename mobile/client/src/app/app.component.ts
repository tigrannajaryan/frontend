import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController, Nav, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { deleteToken, getToken } from '~/core/utils/token-utils';

import { Logger } from '~/shared/logger';
import { PageNames } from '~/core/page-names';

@Component({
  templateUrl: 'app.component.html'
})
export class ClientAppComponent implements OnInit {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  menuPages: Array<{ title: string, component: any }>;

  constructor(
    private logger: Logger,
    private menuCtrl: MenuController,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.logger.info('App initializing...');

    await this.platform.ready();

    this.statusBar.styleDefault();
    this.splashScreen.hide();

    // TODO: use try/catch
    const token = await getToken();
    if (token) {
      this.rootPage = PageNames.Services;
    } else {
      this.rootPage = PageNames.Auth;
      // no expiration, the only case: deactivation of the account
      // discover by making a request
      // discover on next request after the app is started
      // the first request returns 401 unauthorized, and app reacts to it
      // load app –> show screen –> do request –> react if unauthorized
    }
  }

  openPage(page): void {
    if (page.component !== this.nav.getActive().component) {
      this.nav.setRoot(page.component, {}, { animate: false });
    }
  }

  async logout(): Promise<void> {
    // TODO: show nice loader
    await deleteToken();

    // Hide the menu
    this.menuCtrl.close();

    // Erase all previous navigation history and make LoginPage the root
    this.nav.setRoot(PageNames.Auth);
  }
}
