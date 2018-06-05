import { Component, ErrorHandler, ViewChild } from '@angular/core';
import { MenuController, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { PageNames } from '~/core/page-names';
import { Logger } from './shared/logger';
import { AuthApiService } from '~/core/auth-api-service/auth-api-service';
import { UnhandledErrorHandler } from '~/shared/unhandled-error-handler';
import { createNavHistoryList } from '~/core/functions';
import { loading } from '~/core/utils/loading';

@Component({
  templateUrl: 'app.component.html'
})
export class MyAppComponent {
  @ViewChild(Nav) nav: Nav;

  pages: Array<{ title: string, component: any }> = [
    { title: 'Today', component: PageNames.Today },
    { title: 'My Profile', component: PageNames.Profile }
  ];

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public menuCtrl: MenuController,
    private authApiService: AuthApiService,
    private errorHandler: ErrorHandler,
    private logger: Logger
  ) {
    this.logger.info('App initializing...');

    // this.platform.ready()
    //  .then(() => this.initializeApp());
    this.initializeApp();
  }

  @loading
  async initializeApp(): Promise<void> {
    await this.platform.ready();

    // The platform is ready and the plugins are available.
    if (this.errorHandler instanceof UnhandledErrorHandler) {
      this.errorHandler.init(this.nav, PageNames.FirstScreen);
    }

    await this.showInitialPage();

    this.statusBar.styleDefault();
    this.splashScreen.hide();
  }

  async showInitialPage(): Promise<void> {
    if (this.authApiService.getAuthToken()) {
      this.logger.info('We have a stored authentication information. Attempting to restore.');

      // We were previously authenticated, let's try to refresh the token
      // and validate it and show the correct page after that.
      let authResponse;
      try {
        authResponse = await this.authApiService.refreshAuth();
      } catch (e) {
        this.logger.error('Error when trying to refresh auth.');
      }
      // Find out what page should be shown to the user and navigate to
      // it while also properly populating the navigation history
      // so that Back buttons work correctly.
      if (authResponse) {
        this.logger.info('Authentication refreshed.');
        this.nav.setPages(createNavHistoryList(authResponse.profile_status));
        return;
      }
    }

    this.logger.info('No valid authenticated session. Start from first screen.');

    // No valid saved authentication, just show the first screen.
    this.nav.setRoot(PageNames.FirstScreen);
  }

  openPage(page): void {
    // selected page different from current?
    if (page.component !== this.nav.getActive().component) {
      // yes, push it to history and navigate to it
      this.nav.setRoot(page.component, {}, { animate: false });
    }
  }

  logout(): void {
    // Hide the menu
    this.menuCtrl.close();

    // Logout from backend
    this.authApiService.logout();

    // Erase all previous navigation history and make FirstScreen the root
    this.nav.setRoot(PageNames.FirstScreen);
  }
}
