import { Component, ErrorHandler, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { async_all } from '~/shared/async-helpers';
import { Logger } from '~/shared/logger';
import { UnhandledErrorHandler } from '~/shared/unhandled-error-handler';
import { getBuildNumber } from '~/shared/get-build-number';
import { GAWrapper } from '~/shared/google-analytics';

import { PageNames } from '~/core/page-names';
import { AuthApiService } from '~/core/auth-api-service/auth-api-service';
import { arrayEqual, createNavHistoryList } from '~/core/functions';
import { AppStorage } from '~/core/app-storage';

// Google Analytics Id
const gaTrackingId = 'UA-120898935-1';

@Component({
  templateUrl: 'app.component.html'
})
export class MyAppComponent {
  @ViewChild(Nav) nav: Nav;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private authApiService: AuthApiService,
    private errorHandler: ErrorHandler,
    private logger: Logger,
    private ga: GAWrapper,
    private storage: AppStorage
  ) {
    this.logger.info('App: initializing...');
    this.logger.info(`App: Build number ${getBuildNumber()}`);

    this.initializeApp();
  }

  async initializeApp(): Promise<void> {
    const startTime = Date.now();

    // Init the errorHandler
    if (this.errorHandler instanceof UnhandledErrorHandler) {
      this.errorHandler.init(this.nav, PageNames.FirstScreen);
    }

    // First initialize the platform. We cannot do anything else until the platform is
    // ready and the plugins are available.
    await this.platform.ready();

    // Now that the platform is ready asynchronously initialize in parallel everything
    // that our app needs and wait until all initializations finish. Add here any other
    // initialization operation that must be done before the initial page is shown.
    await async_all([
      this.initGa(),
      this.storage.init()
    ]);

    // All initializations are done, show the initial page to the user
    await this.showInitialPage();

    // The initial page is ready to be seen, hide the splash screen
    this.splashScreen.hide();
    this.statusBar.styleDefault();

    // All done, measure the loading time and report to GA
    const loadTime = Date.now() - startTime;
    this.logger.info('App: loaded in', loadTime, 'ms');

    this.ga.trackTiming('Loading', loadTime, 'AppInitialization', 'FirstLoad');
  }

  async initGa(): Promise<void> {
    try {
      this.logger.info(`App: Initializing Google Analytics with id=${gaTrackingId}...`);

      await this.ga.init(gaTrackingId);

      this.logger.info('App: Google Analytics is ready now');

      // Track all screen changes
      this.nav.viewDidEnter.subscribe(view => this.trackViewChange(view));
    } catch (e) {
      this.logger.warn('App: Error starting Google Analytics (this is expected if not on the phone):', e);
    }
  }

  protected trackViewChange(view: any): void {
    const viewClassName: string = (view && view.instance) ? view.instance.constructor.name : 'unknown';
    this.logger.info(`App: Entered ${viewClassName}`);

    // Remove 'Component' suffix for better readability of GA results.
    const viewName = viewClassName.replace(/Component$/, '');
    this.ga.trackView(viewName);
  }

  async showInitialPage(): Promise<void> {
    this.authApiService.init();

    if (this.authApiService.getAuthToken()) {
      this.logger.info('App: We have a stored authentication information. Attempting to restore.');

      // We were previously authenticated, let's try to refresh the token
      // and validate it and show the correct page after that.
      let authResponse;
      try {
        authResponse = await this.authApiService.refreshAuth();
      } catch (e) {
        this.logger.error('App: Error when trying to refresh auth.');
      }
      // Find out what page should be shown to the user and navigate to
      // it while also properly populating the navigation history
      // so that Back buttons work correctly.
      if (authResponse) {
        this.logger.info('App: Authentication refreshed.');

        const requiredPages = createNavHistoryList(authResponse.profile_status);
        const currentPages = this.nav.getViews().map(v => v.name);

        // Check if we are not already displaying exactly what is needed
        if (!arrayEqual(currentPages, requiredPages.map(p => p.page))) {
          this.nav.setPages(requiredPages);
        }
        return;
      }
    }

    this.logger.info('App: No valid authenticated session. Start from first screen.');

    // No valid saved authentication, just show the first screen.
    this.nav.setRoot(PageNames.FirstScreen, {}, { animate: false }, () => this.statusBar.hide());
  }
}
