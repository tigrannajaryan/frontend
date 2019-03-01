import { Component, Input, NgZone, OnInit } from '@angular/core';
import { Page } from 'ionic-angular/navigation/nav-util';
import { AlertController, Content, Events, MenuController, Nav, ViewController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { AuthService } from '~/shared/api/auth.api';
import {
  StylistProfile,
  StylistProfileCompleteness
} from '~/shared/api/stylist-app.models';
import { SharedEventTypes } from '~/shared/events/shared-event-types';
import { getAppVersionNumber, getBuildNumber } from '~/shared/get-build-info';
import { deleteAuthLocalData } from '~/shared/storage/token-utils';

import { LogoutAction } from '~/app.reducers';
import { PageNames } from '~/core/page-names';
import { clearAllDataStores } from '~/core/data.module';
import { ProfileDataStore } from '~/core/profile.data';
import { calcProfileCompleteness } from '~/core/utils/stylist-utils';
import { RegistrationForm } from '~/onboarding/registration.form';

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

  stylistProfileCompleteness: StylistProfileCompleteness;
  profile: StylistProfile;
  menuItems: MenuItem[];
  swipeEnabled: boolean;

  appBuildNumber = getBuildNumber();
  appVersion = getAppVersionNumber();
  PageNames = PageNames;

  private pagesWithoutMenu: Page[] = [
    PageNames.FirstScreen,
    PageNames.Auth,
    PageNames.AuthConfirm
  ];

  private servicesMenuItem: MenuItem;

  static showNotice(page: Page, profile: StylistProfile): boolean {
    switch (page) {
      case PageNames.Settings:
        return !profile.profile_status.can_checkout_with_made
          || !profile.profile_status.google_calendar_integrated;
      case PageNames.Discounts:
        return !profile.profile_status.has_weekday_discounts_set
          || profile.profile_status.must_select_deal_of_week;
      case PageNames.Invitations:
        return !profile.profile_status.has_invited_clients;
      case PageNames.Services:
      case PageNames.ServicesList:
        return !profile.profile_status.has_services_set;
      case PageNames.WorkHours:
        return !profile.profile_status.has_business_hours_set;
      default:
        return false;
    }

  }

  constructor(
    public profileData: ProfileDataStore,
    private authApiService: AuthService,
    private events: Events,
    private menu: MenuController,
    private registrationForm: RegistrationForm,
    private store: Store<{}>,
    private alertCtrl: AlertController,
    private zone: NgZone
  ) {
    const redirectParams = { isRootPage: true };

    this.servicesMenuItem = {
      title: 'Services',
      redirectToPage: PageNames.ServicesList,
      redirectParams,
      icon: 'conditioners-a'
    };

    this.menuItems = [
      { title: 'Appointments', redirectToPage: PageNames.HomeSlots, redirectParams: {}, icon: 'home-a' },
      { title: 'Clients', redirectToPage: PageNames.MyClients, redirectParams, icon: 'stylists-a' },
      { title: 'Discounts', redirectToPage: PageNames.Discounts, redirectParams, icon: 'discounts' },
      { title: 'Calendar', redirectToPage: PageNames.ClientsCalendar, redirectParams, icon: 'calendar-add' },
      { title: 'Hours', redirectToPage: PageNames.WorkHours, redirectParams, icon: 'clock-a' },
      this.servicesMenuItem, // by ref
      { title: 'Invite Clients', redirectToPage: PageNames.Invitations, redirectParams, icon: 'invite-a' },
      { title: 'Settings', redirectToPage: PageNames.Settings, redirectParams: {}, icon: 'settings-a' }
    ];
  }

  /**
   * NOTE: this component is never destroyed
   */
  async ngOnInit(): Promise<void> {
    // Close menu when notification appears in foreground
    // TODO: close menu only when notification clicked
    this.events.subscribe(SharedEventTypes.pushNotification, () => this.menu.close());

    // Track all top-level screen changes
    this.nav.viewDidEnter.subscribe(view => {
      this.swipeEnabled = this.hasMenu(view);
    });
  }

  onMenuOpen(): void {
    this.zone.run(async () => {
      // Make view updates based on profile and profile status

      const { response: profile } = await this.profileData.get({ refresh: true });
      this.profile = profile;

      if (this.profile && this.profile.profile_status) {
        // Set services page or services template page based on `has_services_set`:
        if (this.profile.profile_status.has_services_set) {
          this.servicesMenuItem.redirectToPage = PageNames.ServicesList;
        } else {
          this.servicesMenuItem.redirectToPage = PageNames.Services;
        }

        this.stylistProfileCompleteness = calcProfileCompleteness(this.profile);
      }
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

  onLogoutClick(): void {
    const prompt = this.alertCtrl.create({
      title: '',
      subTitle: 'Are you sure you want to Logout?',
      buttons: [
        {
          text: 'Yes, Logout',
          handler: () => {
            this.onLogout();
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    });
    prompt.present();
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
    this.setPage(PageNames.Profile, {}, true);
  }

  shouldShowNotice(redirectToPage: Page): boolean {
    if (!this.profile) {
      return false;
    }

    return MadeMenuComponent.showNotice(redirectToPage, this.profile);
  }

  private async onLogout(): Promise<void> {
    // Logout from backend
    this.authApiService.logout();

    // Dismiss user’s state
    this.store.dispatch(new LogoutAction());

    // Clear cached registration form
    this.registrationForm.init(/* forced */ true);

    // Clear cached data
    await clearAllDataStores();

    // Delete auth stored data
    await deleteAuthLocalData();

    // Erase all previous navigation history and make FirstScreen the root
    this.nav.setRoot(PageNames.FirstScreen);
  }
}
