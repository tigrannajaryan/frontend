import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Events, Tab, Tabs } from 'ionic-angular';
import { Page } from 'ionic-angular/navigation/nav-util';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { AppAnalytics } from '~/shared/app-analytics';
import { ApiResponse } from '~/shared/api/base.models';

import { PageNames } from '~/core/page-names';
import { ClientEventTypes } from '~/core/client-event-types';
import { checkProfileCompleteness } from '~/core/utils/user-utils';
import { ProfileModel } from '~/core/api/profile.models';
import { ProfileDataStore } from '~/profile/profile.data';

import { StylistSearchParams } from '~/stylists/stylists-search/stylists-search.component';
import { InvitationsComponentParams } from '~/shared/components/invitations/abstract-invitations.component';

interface TabsObject {
  name: string;
  link: Page; // should be PageNames when we will have all pages
  params: any;
  badge?: string | null;
}

export enum MainTabIndex {
  Home = 0,
  StylistSearch,
  Invitation,
  Profile
}

@Component({
  selector: 'main-tabs',
  templateUrl: 'main-tabs.component.html'
})
export class MainTabsComponent implements OnDestroy {
  PageNames = PageNames;
  tabsData: TabsObject[] = [
    {
      name: 'Home',
      link: PageNames.Home,
      params: {}
    },
    // TODO: remove in production, only for testing Stripe API
    {
      name: 'Search',
      link: PageNames.AddCard,
      params: {}
    },
    // {
    //   name: 'Search',
    //   link: PageNames.StylistSearch,
    //   params: { params: ({ isRootPage: true } as StylistSearchParams) }
    // },
    {
      name: 'Invite',
      link: PageNames.Invitations,
      params: { params: ({ isRootPage: true } as InvitationsComponentParams) }
    },
    {
      name: 'Profile',
      link: PageNames.ProfileSummary,
      params: {},
      badge: undefined
    }
  ];

  @ViewChild('tabs')
  tabs: Tabs;
  profileObservable: Observable<ApiResponse<ProfileModel>>;
  private profileObservableSubscription: Subscription;

  private lastSubsrciption: any;

  constructor(
    private events: Events,
    private analytics: AppAnalytics,
    private profileDataStore: ProfileDataStore
  ) {
    this.profileObservable = this.profileDataStore.asObservable();

    // Initiate fetching profile data
    this.profileDataStore.get();

    // Subscribe to profile data changes
    this.profileObservableSubscription = this.profileObservable.subscribe(profileResponse => this.onProfileChange(profileResponse));
  }

  ionViewWillEnter(): void {
    // Subscribe to react to external requests to select a specific tab
    this.events.subscribe(ClientEventTypes.selectMainTab, (idx: MainTabIndex, callback?: (tab: Tab) => void) => {
      this.onTabSelectedFromOutside(idx, callback);
    });

    // Trigger ionViewWillEnter of tab’s child View (see https://github.com/ionic-team/ionic-v3/issues/159).
    const tab = this.tabs.getSelected();
    if (tab) {
      const views = this.tabs.getSelected().getViews();
      const view = views[views.length - 1].instance;
      if (view.ionViewWillEnter) {
        view.ionViewWillEnter();
      }
    }
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe(ClientEventTypes.selectMainTab);
  }

  onTabSelectedFromOutside(idx: MainTabIndex, callback?: (tab: Tab) => void): void {
    const tab = this.tabs.getByIndex(idx);
    if (tab) {
      this.tabs.select(tab);
      if (callback) {
        callback(tab);
      }
    }
  }

  onTabChange(tab: Tab): void {
    // show root tab and clear history
    tab.popToRoot();

    // Track all tab changes
    this.analytics.trackViewChange(tab.getActive());

    // Track all screen changes inside tab
    if (this.lastSubsrciption) {
      this.lastSubsrciption.unsubscribe();
    }
    this.lastSubsrciption = tab.viewDidEnter.subscribe(view => this.analytics.trackViewChange(view));
  }

  onProfileChange(profileResponse: ApiResponse<ProfileModel>): void {
    if (profileResponse.response) {
      this.tabsData[MainTabIndex.Profile].badge =
        checkProfileCompleteness(profileResponse.response).isProfileComplete ? undefined : this.tabsData[MainTabIndex.Profile].name;
    }
  }

  ngOnDestroy(): void {
    this.profileObservableSubscription.unsubscribe();
  }
}
