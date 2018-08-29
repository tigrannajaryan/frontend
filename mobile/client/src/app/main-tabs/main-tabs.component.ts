import { Component, ViewChild } from '@angular/core';
import { Events, IonicPage, Tab, Tabs } from 'ionic-angular';

import { GAWrapper } from '~/shared/google-analytics';
import { PageNames } from '~/core/page-names';
import { EventTypes } from '~/core/event-types';

interface TabsObject {
  name: string;
  link: PageNames; // should be PageNames when we will have all pages
  params: any;
}

enum TabIndex {
  Home = 0,
  History,
  Stylists,
  Profile
}

@IonicPage({
  segment: 'main-tabs'
})
@Component({
  selector: 'main-tabs',
  templateUrl: 'main-tabs.component.html'
})
export class MainTabsComponent {
  protected tabsData: TabsObject[] = [
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
      link: PageNames.Stylists,
      params: { isMain: true }
    },
    {
      name: 'Profile',
      link: PageNames.ProfileSummary,
      params: { isMain: true }
    }
  ];

  @ViewChild('tabs')
  tabs: Tabs;

  private lastSubsrciption: any;

  constructor(
    private events: Events,
    private ga: GAWrapper
  ) {
  }

  ionViewWillEnter(): void {
    // Select Home tab when booking is complete
    this.events.subscribe(EventTypes.bookingComplete, () => this.onBookingComplete());

    // Select Profile tab when navigated to the Profile
    this.events.subscribe(EventTypes.profileSelected, () => this.onProfileSelected());
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe(EventTypes.bookingComplete);
    this.events.unsubscribe(EventTypes.profileSelected);
  }

  onBookingComplete(): void {
    this.tabs.select(TabIndex.Home);
  }

  onProfileSelected(): void {
    this.tabs.select(TabIndex.Profile);
  }

  onTabChange(tab: Tab): void {
    // Track all tab changes
    this.ga.trackView(tab.tabTitle);

    // Track all screen changes inside tab
    if (this.lastSubsrciption) {
      this.lastSubsrciption.unsubscribe();
    }
    this.lastSubsrciption = tab.viewDidEnter.subscribe(view => this.ga.trackViewChange(view));
  }
}
