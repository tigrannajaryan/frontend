import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Events, MenuController, Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { Logger } from '~/shared/logger';
import { GAWrapper } from '~/shared/google-analytics';
import { ServerStatusTracker } from '~/shared/server-status-tracker';

import { getToken } from '~/core/utils/token-utils';
import { LogoutAction } from '~/auth/auth.reducer';

import { AUTHORIZED_ROOT, PageNames, UNAUTHORIZED_ROOT } from '~/core/page-names';
import { EventTypes } from '~/core/event-types';

interface MenuPage {
  title: string;
  component: PageNames;
}

// Google Analytics Id
const gaTrackingId = 'UA-122004541-1';

@Component({
  templateUrl: 'app.component.html'
})
export class ClientAppComponent implements OnInit, OnDestroy {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  menuPages: MenuPage[] = [
    { title: 'Home', component: PageNames.Home },
    { title: 'History', component: PageNames.AppointmentsHistory },
    { title: 'Profile', component: PageNames.ProfileSummary },
    { title: 'Date', component: PageNames.SelectDate }
  ];

  constructor(
    private events: Events,
    private ga: GAWrapper,
    private logger: Logger,
    private menuCtrl: MenuController,
    private platform: Platform,
    private screenOrientation: ScreenOrientation,
    private serverStatusTracker: ServerStatusTracker,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private store: Store<{}>
  ) {
  }

  async ngOnInit(): Promise<void> {
    const startTime = Date.now();

    this.logger.info('App initializing...');

    this.serverStatusTracker.init(PageNames.Auth);

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
    await this.ga.init(gaTrackingId);

    // Track all top-level screen changes
    this.nav.viewDidEnter.subscribe(view => this.ga.trackViewChange(view));

    this.statusBar.styleDefault();
    this.splashScreen.hide();

    // TODO: use try/catch
    const token = await getToken();
    if (token) {
      this.rootPage = AUTHORIZED_ROOT;
    } else {
      this.rootPage = UNAUTHORIZED_ROOT;
      // no expiration, the only case: deactivation of the account
      // discover by making a request
      // discover on next request after the app is started
      // the first request returns 401 unauthorized, and app reacts to it
      // load app –> show screen –> do request –> react if unauthorized
    }

    // Subscribe to some interesting global events
    this.events.subscribe(EventTypes.logout, () => this.onLogout());
    this.events.subscribe(EventTypes.startBooking, () => this.onStartBooking());
    this.events.subscribe(EventTypes.startRebooking, () => this.onStartRebooking());

    // All done, measure the loading time and report to GA
    const loadTime = Date.now() - startTime;
    this.logger.info('App: loaded in', loadTime, 'ms');

    this.ga.trackTiming('Loading', loadTime, 'AppInitialization', 'FirstLoad');
  }

  ngOnDestroy(): void {
    this.events.unsubscribe(EventTypes.logout);
    this.events.unsubscribe(EventTypes.startBooking);
    this.events.unsubscribe(EventTypes.startRebooking);
  }

  onLogout(): void {
    this.nav.setRoot(UNAUTHORIZED_ROOT);
  }

  onStartBooking(): void {
    // Begin booking process by showing service categories selection screen
    this.nav.push(PageNames.ServicesCategories);
  }

  onStartRebooking(): void {
    // Begin booking process by showing date selection (since services are already known)
    this.nav.push(PageNames.SelectDate);
  }

  openPage(page: MenuPage): void {
    if (page.component !== this.nav.getActive().component) {
      this.nav.setRoot(page.component, {}, { animate: false });
    }
  }

  onLogoutClick(): void {
    this.store.dispatch(new LogoutAction(() => this.menuCtrl.close()));
  }
}
