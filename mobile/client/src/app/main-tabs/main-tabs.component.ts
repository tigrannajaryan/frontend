import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  Book,
  History,
  Stylists
}

@IonicPage({
  segment: 'main-tabs'
})
@Component({
  selector: 'main-tabs',
  templateUrl: 'main-tabs.component.html'
})
export class MainTabsComponent implements OnInit, OnDestroy {
  protected tabsData: TabsObject[] = [
    {
      name: 'Home',
      link: PageNames.Home,
      params: { isMain: true }
    },
    {
      name: 'Book',
      link: PageNames.ServicesCategories,
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

  ngOnInit(): void {
    // Select Home tab when booking is complete
    this.events.subscribe(EventTypes.bookingComplete, () => this.tabs.select(TabIndex.Home));
  }

  ngOnDestroy(): void {
    this.events.unsubscribe(EventTypes.bookingComplete);
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
