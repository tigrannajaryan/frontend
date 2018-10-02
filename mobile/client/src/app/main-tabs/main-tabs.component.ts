import { Component, ViewChild } from '@angular/core';
import { Events, Tab, Tabs } from 'ionic-angular';

import { GAWrapper } from '~/shared/google-analytics';
import { PageNames } from '~/core/page-names';
import { EventTypes } from '~/core/event-types';
import { Page } from 'ionic-angular/navigation/nav-util';

interface TabsObject {
  name: string;
  link: Page; // should be PageNames when we will have all pages
  params: any;
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
      link: PageNames.StylistInvitation,
      params: {}
    },
    {
      name: 'Profile',
      link: PageNames.ProfileSummary,
      params: {}
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
    this.ga.trackView(tab.tabTitle);

    // Track all screen changes inside tab
    if (this.lastSubsrciption) {
      this.lastSubsrciption.unsubscribe();
    }
    this.lastSubsrciption = tab.viewDidEnter.subscribe(view => this.ga.trackViewChange(view));
  }
}
