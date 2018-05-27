import { Component, ErrorHandler, ViewChild } from '@angular/core';
import { MenuController, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { PageNames } from '~/core/page-names';
import { Logger } from './shared/logger';
import { TodayComponent } from './today/today.component';
import { AuthApiService } from '~/core/auth-api-service/auth-api-service';
import { UnhandledErrorHandler } from '~/shared/unhandled-error-handler';

@Component({
  templateUrl: 'app.component.html'
})
export class MyAppComponent {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = PageNames.FirstScreen;

  pages: Array<{ title: string, component: any }>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public menuCtrl: MenuController,
    private authApiService: AuthApiService,
    private errorHandler: ErrorHandler,
    private logger: Logger) {

    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Today', component: TodayComponent }
    ];
  }

  initializeApp(): void {
    this.logger.info('App initializing...');
    this.platform.ready()
      .then(() => {
        // Okay, so the platform is ready and our plugins are available.
        if (this.errorHandler instanceof UnhandledErrorHandler) {
          this.errorHandler.init(this.nav, PageNames.FirstScreen);
        }
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      });
  }

  openPage(page): void {
    // selected page different from current?
    if (page.component !== this.nav.getActive().component) {
      // yes, push it to history and navigate to it
      this.nav.push(page.component, {}, { animate: false });
    }
  }

  logout(): void {
    // Hide the menu
    this.menuCtrl.close();

    this.authApiService.logout();

    // Erase all previous navigation history and make LoginPage the root
    this.nav.setRoot(PageNames.FirstScreen);
  }
}
