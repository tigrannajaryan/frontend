import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { App, Events, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { getBuildNumber, getCommitHash } from '~/shared/get-build-info';
import { GAWrapper } from '~/shared/google-analytics';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import {
  AuthLocalData,
  authResponseToTokenModel,
  deleteAuthLocalData,
  getAuthLocalData,
  saveAuthLocalData
} from '~/shared/storage/token-utils';

import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { ClientEventTypes } from '~/core/client-event-types';
import { PageNames, UNAUTHORIZED_ROOT } from '~/core/page-names';

import { startBooking } from '~/booking/booking-utils';
import { ENV } from '~/environments/environment.default';
import { ServicesCategoriesParams } from '~/services-categories-page/services-categories-page.component';
import { async_all } from './shared/async-helpers';
import { PushNotification } from './shared/push/push-notification';
import { SharedEventTypes } from './shared/events/shared-event-types';
import { AuthResponse } from './shared/api/auth.models';
import { AuthService } from './shared/api/auth.api';
import { ClientAppStorage } from './core/client-app-storage';

@Component({
  templateUrl: 'app.component.html'
})
export class ClientAppComponent implements OnInit, OnDestroy {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  constructor(
    private app: App,
    private authApiService: AuthService,
    private events: Events,
    private ga: GAWrapper,
    private logger: Logger,
    private platform: Platform,
    private preferredStylistsData: PreferredStylistsData,
    private pushNotification: PushNotification,
    private screenOrientation: ScreenOrientation,
    private serverStatusTracker: ServerStatusTracker,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: ClientAppStorage
  ) {
  }

  async ngOnInit(): Promise<void> {
    const startTime = Date.now();

    this.logger.info('App initializing...');
    this.logger.info(`Build: ${getBuildNumber()} Commit: ${getCommitHash()}`);

    // The call of `deleteAuthLocalData` prevents weird error of allways navigating to the Auth page.
    this.serverStatusTracker.init(UNAUTHORIZED_ROOT, deleteAuthLocalData);

    // First initialize the platform. We cannot do anything else until the platform is
    // ready and the plugins are available.
    await this.platform.ready();

    // Lock screen orientation to portrait if it’s available
    this.screenOrientation.lock('portrait').catch(error => {
      this.logger.warn(error);
    });

    // Now that the platform is ready asynchronously initialize in parallel everything
    // that our app needs and wait until all initializations finish. Add here any other
    // initialization operation that must be done before the initial page is shown.
    await async_all([
      this.ga.init(ENV.gaTrackingId),
      this.storage.init()
    ]);

    await this.pushNotification.init(this.app.getRootNav(), PageNames.PushPrimingScreen, this.storage);

    // Track all top-level screen changes
    this.nav.viewDidEnter.subscribe(view => this.ga.trackViewChange(view));

    this.statusBar.styleDefault();
    this.splashScreen.hide();

    const authToken: AuthLocalData = await getAuthLocalData(); // no expiration

    // Subscribe to some interesting global events
    this.events.subscribe(SharedEventTypes.afterLogout, () => this.onLogout());
    this.events.subscribe(ClientEventTypes.startBooking, (stylistUuid?: string) => this.onStartBooking(stylistUuid));
    this.events.subscribe(ClientEventTypes.startRebooking, () => this.onStartRebooking());

    // All done, measure the loading time and report to GA
    const loadTime = Date.now() - startTime;
    this.logger.info('App: loaded in', loadTime, 'ms');

    this.ga.trackTiming('Loading', loadTime, 'AppInitialization', 'FirstLoad');

    if (!authToken) {
      this.rootPage = PageNames.FirstScreen;
    } else {

      if (!authToken.user_uuid) {
        // user_uuid previously didn't exist. It was added to the API recently. Refresh auth to make sure we have this field.
        this.refreshAuth(authToken);
      }

      // Let pushNotification know who is the current user
      this.pushNotification.setUser(authToken.user_uuid);

      // See if user already has preferred stylists
      const preferredStylists = await this.preferredStylistsData.get();
      if (preferredStylists.length === 0) {
        // Haven’t completed onboarding, should restart:
        this.rootPage = PageNames.HowMadeWorks;
      } else {
        // We are authenticated and almost ready to start using the app normally.
        // One last thing: show push permission asking screen if needed and wait until the user makes a choice
        await this.pushNotification.showPermissionScreen(true);

        // All set now. Show the main screen.
        this.rootPage = PageNames.MainTabs;
      }
    }
  }

  ngOnDestroy(): void {
    this.events.unsubscribe(SharedEventTypes.afterLogout);
    this.events.unsubscribe(ClientEventTypes.startBooking);
    this.events.unsubscribe(ClientEventTypes.startRebooking);
  }

  onLogout(): void {
    this.nav.setRoot(UNAUTHORIZED_ROOT);
  }

  /**
   * This method starts booking or re-booking process.
   * There are 3 possible cases.
   *
   * 1. When stylist uuid is provided in event we should proceed with booking of the provided stylist.
   * 2. When preferred stylist is an only one we should proceed with booking of this stylist.
   * 3. When there are more then 1 preferred stylists we should show stylists selector first.
   *
   * NOTE 1: we are able to start booking only for (1) and (2). For the (3) we should start booking after a stylist is selected.
   * NOTE 2: stylists selector page can handle empty preferred stylists case.
   */
  async onStartBooking(stylistUuid: string): Promise<void> {
    const params: ServicesCategoriesParams = { stylistUuid: undefined};

    if (stylistUuid) {
      // Stylist is already selected proceed to services.
      // Happens in
      // - booking on stylist card pic click,
      // - re-booking with some services changed.
      params.stylistUuid = stylistUuid;
    }

    // No stylist’s uuid provided, let’s use preferred ones.
    let preferredStylists = await this.preferredStylistsData.get();
    preferredStylists = preferredStylists.filter(stylist => stylist.is_profile_bookable);

    if (preferredStylists.length === 1) {
      // We have only one preferred stylist, no need to show stylist selector and we are able to start booking:
      params.stylistUuid = preferredStylists[0].uuid;
    }

    if (params.stylistUuid) {
      // When stylist is choosen already:
      await startBooking(params.stylistUuid);
      this.nav.push(PageNames.ServicesCategories, { params });

    } else {
      // We need to choose one of many preferred stylists to continue. Show selector page.
      // TODO: handle empty preferred stylist here, not inside PageNames.SelectStylist
      this.nav.push(PageNames.SelectStylist);
    }
  }

  onStartRebooking(): void {
    // Begin booking process by showing date selection (since services are already known)
    this.nav.push(PageNames.SelectDate);
  }

  private async refreshAuth(authToken: AuthLocalData): Promise<void> {
    let authResponse: AuthResponse;
    try {
      authResponse = (await this.authApiService.refreshAuth(authToken.token).get()).response;
    } catch (e) {
      this.logger.error('App: Error when trying to refresh auth.', e);
    }
    if (authResponse) {
      this.logger.info('App: Authentication refreshed.');
      saveAuthLocalData(authResponseToTokenModel(authResponse));
    } else {
      this.logger.info('App: Cannot refresh authentication. Continue using saved session.');
    }
  }
}
