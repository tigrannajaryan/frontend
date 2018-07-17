import { Component, ErrorHandler, ViewChild } from '@angular/core';
import { MenuController, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Store } from '@ngrx/store';

import { PageNames } from '~/core/page-names';
import { Logger } from './shared/logger';
import { AuthApiService } from '~/core/auth-api-service/auth-api-service';
import { UnhandledErrorHandler } from '~/shared/unhandled-error-handler';
import { createNavHistoryList } from '~/core/functions';
import { getBuildNumber } from '~/shared/get-build-number';
import { loading } from '~/core/utils/loading';
import { GAWrapper } from '~/shared/google-analytics';
import { LogoutAction } from '~/app.reducers';

// Google Analytics Id
const gaTrackingId = 'UA-120898935-1';

@Component({
  templateUrl: 'app.component.html'
})
export class MyAppComponent {
  @ViewChild(Nav) nav: Nav;

  pages: Array<{ title: string, component: any }> = [
    { title: 'Home', component: PageNames.Home },
    { title: 'My Profile', component: PageNames.Profile }
  ];

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public menuCtrl: MenuController,
    private authApiService: AuthApiService,
    private errorHandler: ErrorHandler,
    private logger: Logger,
    private ga: GAWrapper,
    private store: Store<any>
  ) {
    this.logger.info('App initializing...');
    this.logger.info(`Build number ${getBuildNumber()}`);
    this.initializeApp();
  }

  @loading
  async initializeApp(): Promise<void> {
    const startTime = Date.now();

    await this.platform.ready();
    // The platform is ready and the plugins are available.

    this.initGa();

    if (this.errorHandler instanceof UnhandledErrorHandler) {
      this.errorHandler.init(this.nav, PageNames.FirstScreen);
    }

    await this.showInitialPage();

    this.statusBar.styleDefault();
    this.splashScreen.hide();

    const loadTime = Date.now() - startTime;

    this.ga.trackTiming('Loading', loadTime, 'AppInitialization', 'FirstLoad');
  }

  async initGa(): Promise<void> {
    try {
      this.logger.info(`Initializing Google Analytics with id=${gaTrackingId}...`);

      await this.ga.init(gaTrackingId);

      this.logger.info('Google Analytics is ready now');

      // Track all screen changes
      this.nav.viewDidEnter.subscribe(view => this.trackViewChange(view));
    } catch (e) {
      this.logger.warn('Error starting Google Analytics (this is expected if not on the phone):', e);
    }
  }

  protected trackViewChange(view: any): void {
    const viewClassName: string = (view && view.instance) ? view.instance.constructor.name : 'unknown';
    this.logger.info(`Entered ${viewClassName}`);

    // Remove 'Component' suffix for better readability of GA results.
    const viewName = viewClassName.replace(/Component$/, '');
    this.ga.trackView(viewName);
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
    this.nav.setRoot(PageNames.FirstScreen, {}, { animate: false }, () => this.statusBar.hide());
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

    // Dismiss user’s state
    this.store.dispatch(new LogoutAction());

    // Erase all previous navigation history and make FirstScreen the root
    this.nav.setRoot(PageNames.FirstScreen);
  }
}
