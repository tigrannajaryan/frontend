import { Component, ViewChild } from '@angular/core';
import { Events, Refresher, Slides } from 'ionic-angular';

import { PreferredStylistModel, PreferredStylistsListResponse, StylistModel } from '~/shared/api/stylists.models';
import { componentUnloaded } from '~/shared/component-unloaded';

import { EventTypes } from '~/core/event-types';
import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

export enum Tabs {
  myStylists = 0,
  savedStylists = 1
}

export enum TabNames {
  myStylists = 'My Stylists',
  savedStylists = 'Saved'
}

@Component({
  selector: 'page-stylists',
  templateUrl: 'my-stylists.component.html'
})
export class MyStylistsComponent {
  @ViewChild(Slides) slides: Slides;
  activeStylist?: StylistModel;
  tabs = [
    {
      name: TabNames.myStylists,
      loaded: false,
      stylists: []
    },
    {
      name: TabNames.savedStylists,
      loaded: false,
      stylists: []
    }
  ];
  activeTab: TabNames;

  Tabs = Tabs;
  TabNames = TabNames;
  PageNames = PageNames;

  refresherEnabled = true;

  // Indicates that we are inside onboarding flow:
  onboarding = false;

  constructor(
    private events: Events,
    private preferredStylistsData: PreferredStylistsData
  ) {
  }

  ionViewDidLoad(): void {
    this.activeTab = this.tabs[Tabs.myStylists].name;

    this.preferredStylistsData.data.asObservable()
      .takeUntil(componentUnloaded(this))
      .subscribe(apiResponse => this.splitStylistsList(apiResponse.response));
  }

  ionViewWillEnter(): void {
    this.events.subscribe(EventTypes.selectStylistTab, (tabIndex: Tabs) => this.onTabChange(tabIndex));
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe(EventTypes.selectStylistTab);
  }

  onTabChange(tabIndex: Tabs): void {
    this.slides.slideTo(tabIndex);
    this.activeTab = this.tabs[tabIndex].name;
  }

  onTabSwipe(): void {
    // if index more or equal to tabs length we got an error
    if (this.slides.getActiveIndex() >= this.tabs.length) {
      return;
    }
    this.activeTab = this.tabs[this.slides.getActiveIndex()].name;
  }

  onSetActiveStylist(stylist: StylistModel | undefined): void {
    this.activeStylist = stylist;
  }

  onEnableRefresher(isEnabled: boolean): void {
    this.refresherEnabled = isEnabled;
  }

  onRemoveStylist(stylist: PreferredStylistModel): void {
    this.preferredStylistsData.removeStylist(stylist.preference_uuid);
  }

  onRefresh(refresher: Refresher): void {
    try {
      // Reload stylists information
      this.preferredStylistsData.get({ refresh: true });
    } finally {
      // When stylists reloading is done close the refresher.
      refresher.complete();
    }
  }

  /**
   * Split stylists list to two separate lists
   * and use it for different tabs
   * @param res: response with stylists array
   */
  splitStylistsList(res: PreferredStylistsListResponse): void {
    if (!res) {
      return;
    }

    // splitStylists = sorted array of two arrays
    const splitStylists = res.stylists.reduce((tabsObj, cur) => {
      const tab = cur.is_profile_bookable ? Tabs.myStylists : Tabs.savedStylists;

      if (!tabsObj[tab]) {
        tabsObj[tab] = [];
      }

      tabsObj[tab].push(cur);
      return tabsObj;
    }, []);

    // replace old list with new one
    // we need replace it (not clear and set)
    // to prevent from blinking html
    this.tabs[Tabs.myStylists].stylists = splitStylists[Tabs.myStylists];
    this.tabs[Tabs.myStylists].loaded = true;
    this.tabs[Tabs.savedStylists].stylists = splitStylists[Tabs.savedStylists];
    this.tabs[Tabs.savedStylists].loaded = true;
  }
}
