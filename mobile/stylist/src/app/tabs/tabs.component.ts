import { Component, ViewChild } from '@angular/core';
import { Events, Tab, Tabs } from 'ionic-angular';
import { Page } from 'ionic-angular/navigation/nav-util';

import { GAWrapper } from '~/shared/google-analytics';
import { PageNames } from '~/core/page-names';
import { EventTypes } from '~/core/event-types';

interface TabsObject {
  name: string;
  link: Page;
  params: any;
}

export enum TabIndex {
  Home = 0,
  Hours,
  Discount,
  Services,
  Invite
}

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.component.html'
})
export class TabsComponent {
  protected tabsData: TabsObject[] = [
    {
      name: 'Home',
      link: PageNames.Home,
      params: undefined
    },
    {
      name: 'Hours',
      link: PageNames.Worktime,
      params: { isProfile: true }
    },
    {
      name: 'Discount',
      link: PageNames.Discounts,
      params: { isProfile: true }
    },
    {
      name: 'Services',
      link: PageNames.ServicesList,
      params: { isProfile: true }
    },
    {
      name: 'Invite',
      link: PageNames.Invitations,
      params: { isMainScreen: true }
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
    this.ga.trackViewChange(tab.getActive());

    // Track all screen changes inside tab
    if (this.lastSubsrciption) {
      this.lastSubsrciption.unsubscribe();
    }
    this.lastSubsrciption = tab.viewDidEnter.subscribe(view => this.ga.trackViewChange(view));
  }
}
