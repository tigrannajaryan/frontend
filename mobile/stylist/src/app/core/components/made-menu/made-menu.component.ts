import { Component, Input, OnInit } from '@angular/core';
import { Page } from 'ionic-angular/navigation/nav-util';
import { Content, Events, MenuController, Nav, ViewController } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '~/shared/api/auth.api';
import { StylistProfile } from '~/shared/api/stylist-app.models';
import { SharedEventTypes } from '~/shared/events/shared-event-types';
import { getAppVersionNumber, getBuildNumber } from '~/shared/get-build-info';
import { ApiResponse } from '~/shared/api/base.models';
import { deleteAuthLocalData } from '~/shared/storage/token-utils';

import { LogoutAction } from '~/app.reducers';
import { PageNames } from '~/core/page-names';
import { clearAllDataStores } from '~/core/data.module';
import { ProfileDataStore } from '~/core/profile.data';
import { StylistEventTypes } from '~/core/stylist-event-types';

interface MenuItem {
  title: string;
  redirectToPage: Page;
  redirectParams: any;
  icon?: string;
}

@Component({
  selector: 'made-menu',
  templateUrl: 'made-menu.component.html'
})
export class MadeMenuComponent implements OnInit {
  @Input() content: Content;
  @Input() nav: Nav;

  profile: StylistProfile;
  menuItems: MenuItem[];
  swipeEnabled: boolean;

  appBuildNumber = getBuildNumber();
  appVersion = getAppVersionNumber();
  PageNames = PageNames;

  private profileSubscription: Subscription;

  private pagesWithoutMenu: Page[] = [
    PageNames.FirstScreen,
    PageNames.Auth,
    PageNames.AuthConfirm
  ];

  constructor(
    public profileData: ProfileDataStore,
    private authApiService: AuthService,
    private events: Events,
    private menu: MenuController,
    private store: Store<{}>
  ) {
    const redirectParams = { isRootPage: true };

    this.menuItems = [
      { title: 'Appointments', redirectToPage: PageNames.HomeSlots, redirectParams: {}, icon: 'home-a' },
      { title: 'Clients', redirectToPage: PageNames.MyClients, redirectParams, icon: 'stylists-a' },
      { title: 'Discounts', redirectToPage: PageNames.Discounts, redirectParams, icon: 'discounts' },
      { title: 'Calendar', redirectToPage: PageNames.ClientsCalendar, redirectParams, icon: 'calendar-add' },
      { title: 'Hours', redirectToPage: PageNames.WorkHours, redirectParams, icon: 'clock-a' },
      { title: 'Services', redirectToPage: PageNames.ServicesList, redirectParams, icon: 'conditioners-a' },
      { title: 'Invite Clients', redirectToPage: PageNames.Invitations, redirectParams, icon: 'invite-a' }
    ];
  }

  /**
   * NOTE: this component is never destroyed
   */
  async ngOnInit(): Promise<void> {
    this.subscribe();

    this.events.subscribe(
      StylistEventTypes.menuUpdateProfileSubscription,
      () => {
        this.resubscribe();
      }
    );

    this.events.subscribe(
      SharedEventTypes.pushNotification,
      () => {
        this.menu.close();
      }
    );

    // Track all top-level screen changes
    this.nav.viewDidEnter.subscribe(view => {
      this.swipeEnabled = this.hasMenu(view);
    });
  }

  setPage(redirectToPage: Page, params: any, isRootPage = true): void {
    if (isRootPage) {
      // Reset the content nav to have just this page
      // we wouldn't want the back button to show in this scenario
      this.nav.setRoot(redirectToPage, { params });
    } else {
      this.nav.push(redirectToPage, { params });
    }
  }

  async onLogoutClick(): Promise<void> {
    // Logout from backend
    this.authApiService.logout();

    // Dismiss user’s state
    this.store.dispatch(new LogoutAction());

    // Clear cached data
    await clearAllDataStores();

    // Delete auth stored data
    await deleteAuthLocalData();

    // Erase all previous navigation history and make FirstScreen the root
    this.nav.setRoot(PageNames.FirstScreen);
  }

  hasMenu(currentPage: ViewController): boolean {
    for (const page of this.pagesWithoutMenu) {
      // page and currentPage.component will be uglified by AOT compiler in production build.
      // but class name will be equal if we tried to compare (example - eo === eo)
      // and in this particular case it will be enough
      if (page === currentPage.component) {
        return false;
      }
    }

    return true;
  }

  onMenuClick(): void {
    this.setPage(PageNames.Profile, {}, false);
  }

  private subscribe(): void {
    this.profileSubscription = this.profileData.subscribe((profileResponse: ApiResponse<StylistProfile>) => {
      this.profile = profileResponse.response;
    });
    this.profileData.get();
  }

  private resubscribe(): void {
    this.profileSubscription.unsubscribe();
    this.subscribe();
  }
}
