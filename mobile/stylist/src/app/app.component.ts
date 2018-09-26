import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { async_all } from '~/shared/async-helpers';
import { Logger } from '~/shared/logger';
import { getBuildNumber } from '~/shared/get-build-number';
import { GAWrapper } from '~/shared/google-analytics';
import { AuthApiService, TokenStorage } from '~/shared/stylist-api/auth-api-service';

import { PageNames } from '~/core/page-names';
import { createNavHistoryList } from '~/core/functions';
import { AppStorage } from '~/core/app-storage';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { ENV } from '~/environments/environment.default';
import { AuthResponse } from '~/shared/stylist-api/auth-api-models';

class TokenStorageImpl implements TokenStorage {
  constructor(private appStorage: AppStorage) {}

  get(): string {
    return this.appStorage.get('authToken');
  }

  set(token: string): void {
    return this.appStorage.set('authToken', token);
  }
}

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
    private logger: Logger,
    private ga: GAWrapper,
    private serverStatusTracker: ServerStatusTracker,
    private storage: AppStorage,
    private screenOrientation: ScreenOrientation
  ) {
    this.logger.info('App: initializing...');
    this.logger.info(`App: Build number ${getBuildNumber()}`);

    this.initializeApp();
  }

  async initializeApp(): Promise<void> {
    const startTime = Date.now();

    this.serverStatusTracker.init(PageNames.FirstScreen);

    // First initialize the platform. We cannot do anything else until the platform is
    // ready and the plugins are available.
    await this.platform.ready();

    // Now that the platform is ready asynchronously initialize in parallel everything
    // that our app needs and wait until all initializations finish. Add here any other
    // initialization operation that must be done before the initial page is shown.
    await async_all([
      this.ga.init(ENV.gaTrackingId),
      this.storage.init()
    ]);

    // Lock screen orientation to portrait if this is real device
    if (!(this.platform.is('core') || this.platform.is('mobileweb'))) {
      this.screenOrientation.lock('portrait');
    }

    // Track all top-level screen changes
    this.nav.viewDidEnter.subscribe(view => this.ga.trackViewChange(view));

    // All initializations are done, show the initial page to the user
    await this.showInitialPage();

    // The initial page is ready to be seen, hide the splash screen
    this.splashScreen.hide();
    this.statusBar.styleDefault();
    if (this.platform.is('android')) {
      this.statusBar.styleLightContent();
    }

    // All done, measure the loading time and report to GA
    const loadTime = Date.now() - startTime;
    this.logger.info('App: loaded in', loadTime, 'ms');

    this.ga.trackTiming('Loading', loadTime, 'AppInitialization', 'FirstLoad');
  }

  async showInitialPage(): Promise<void> {
    this.authApiService.init(new TokenStorageImpl(this.storage));

    if (this.authApiService.getAuthToken()) {
      this.logger.info('App: We have a stored authentication information. Attempting to restore.');

      // We were previously authenticated, let's try to refresh the token
      // and validate it and show the correct page after that.
      let authResponse: AuthResponse;
      try {
        authResponse = (await this.authApiService.refreshAuth().toPromise()).response;
      } catch (e) {
        this.logger.error('App: Error when trying to refresh auth.');
      }
      // Find out what page should be shown to the user and navigate to
      // it while also properly populating the navigation history
      // so that Back buttons work correctly.
      if (authResponse) {
        this.logger.info('App: Authentication refreshed.');

        const requiredPages = createNavHistoryList(authResponse.profile_status);
        this.nav.setPages(requiredPages);
        return;
      }
    }

    this.logger.info('App: No valid authenticated session. Start from first screen.');

    // No valid saved authentication, just show the first screen.
    this.nav.setRoot(PageNames.FirstScreen, {}, { animate: false }, () => this.statusBar.hide());
  }
}
