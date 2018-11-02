import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Events, Tab, Tabs } from 'ionic-angular';

import { GAWrapper } from '~/shared/google-analytics';
import { PageNames } from '~/core/page-names';
import { EventTypes } from '~/core/event-types';
import { Page } from 'ionic-angular/navigation/nav-util';
import { checkProfileCompleteness } from '~/core/utils/user-utils';
import { Observable, Subscription } from 'rxjs';
import { ApiResponse } from '~/shared/api/base.models';
import { ProfileModel } from '~/core/api/profile.models';
import { ProfileDataStore } from '~/profile/profile.data';

interface TabsObject {
  name: string;
  link: Page; // should be PageNames when we will have all pages
  params: any;
  badge?: string | null;
}

export enum TabIndex {
  Home = 0,
  History,
  Stylists,
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
      params: { isMain: true }
    },
    {
      name: 'History',
      link: PageNames.AppointmentsHistory,
      params: { isMain: true }
    },
    {
      name: 'Stylists',
      link: PageNames.MyStylists,
      params: {}
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
    private profileDataStore: ProfileDataStore,
    private ga: GAWrapper
  ) {
    this.profileObservable = this.profileDataStore.asObservable();

    this.profileDataStore.get();

    this.profileObservableSubscription = this.profileObservable.subscribe(user => {
      if (user.response) {
        this.tabsData[TabIndex.Profile].badge =
          checkProfileCompleteness(user.response).isProfileComplete ? undefined : this.tabsData[TabIndex.Profile].name;
      }
    });
  }

  ionViewWillEnter(): void {
    this.events.subscribe(EventTypes.selectMainTab, (idx: TabIndex, callback?: (tab: Tab) => void) => {
      this.onTabSelectedFromOutside(idx, callback);
    });
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe(EventTypes.selectMainTab);
  }

  onTabSelectedFromOutside(idx: TabIndex, callback?: (tab: Tab) => void): void {
    const tab = this.tabs.getByIndex(idx);
    if (tab) {
      this.tabs.select(tab);
      if (callback) {
        callback(tab);
      }
    }
  }

  onTabChange(tab: Tab): void {
    // Track all tab changes
    this.ga.trackViewChange(tab.getActive());

    // Track all screen changes inside tab
    if (this.lastSubsrciption) {
      this.lastSubsrciption.unsubscribe();
    }
    this.lastSubsrciption = tab.viewDidEnter.subscribe(view => this.ga.trackViewChange(view));
  }

  ngOnDestroy(): void {
    this.profileObservableSubscription.unsubscribe();
  }
}
