import { Component, ViewChild } from '@angular/core';
import { Events, NavController, Refresher, Slides } from 'ionic-angular';

import {
  PreferredStylistModel,
  PreferredStylistsListResponse,
  StylistModel
} from '~/shared/api/stylists.models';
import { componentUnloaded } from '~/shared/component-unloaded';

import { ClientEventTypes } from '~/core/client-event-types';
import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { ApiResponse } from '~/shared/api/base.models';
import { BookingData } from '~/core/api/booking.data';

export enum MyStylistsTabs {
  madeStylists = 0,
  savedStylists = 1
}

export enum TabNames {
  madeStylists = 'MADE Stylists',
  savedStylists = 'Stylists'
}

@Component({
  selector: 'my-stylists',
  templateUrl: 'my-stylists.component.html'
})
export class MyStylistsComponent {
  @ViewChild(Slides) slides: Slides;
  activeStylist?: StylistModel;
  tabs = [
    {
      name: TabNames.madeStylists,
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

  MyStylistsTabs = MyStylistsTabs;
  totalStylistsCount: number;
  TabNames = TabNames;
  PageNames = PageNames;

  refresherEnabled = true;

  // Indicates that we are inside onboarding flow:
  onboarding = false;

  constructor(
    private bookingData: BookingData,
    private events: Events,
    private navCtrl: NavController,
    private preferredStylistsData: PreferredStylistsData
  ) {
  }

  ionViewDidLoad(): void {
    this.activeTab = this.tabs[MyStylistsTabs.madeStylists].name;

    this.preferredStylistsData.get();

    this.preferredStylistsData.data.asObservable()
      .takeUntil(componentUnloaded(this))
      .subscribe((apiResponse: ApiResponse<PreferredStylistsListResponse>) => {
        if (!apiResponse.response) {
          return;
        }

        const stylists = apiResponse.response.stylists;
        this.totalStylistsCount = stylists.length;
        this.splitStylistsList(stylists);
      });
  }

  ionViewWillEnter(): void {
    // Subscribe to be able to activate tab from outside the component:
    this.events.subscribe(ClientEventTypes.selectStylistTab, (tabIndex: MyStylistsTabs) => this.onTabChange(tabIndex));
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe(ClientEventTypes.selectStylistTab);
  }

  onTabChange(tabIndex: MyStylistsTabs): void {
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
    // do not remove last madeStylists, at least one is required
    if (this.activeTab === TabNames.madeStylists && this.tabs[MyStylistsTabs.madeStylists].stylists.length === 1) {
      return;
    }

    this.preferredStylistsData.removeStylist(stylist.preference_uuid);
  }

  async onShowCalendar(stylist: StylistModel): Promise<void> {
    this.bookingData.start(stylist);

    // We want to show the price calendar of this stylist for the most popular service
    const { response } = await this.bookingData.selectMostPopularService();
    if (response) {
      this.navCtrl.push(PageNames.SelectDate);
    }
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

  goToStylistsSearch(): void {
    this.navCtrl.push(PageNames.StylistSearch);
  }

  isStylistsSearchButtonVisible(): boolean {
    if (
      this.tabs[MyStylistsTabs.madeStylists].name === this.activeTab &&
      this.tabs[MyStylistsTabs.madeStylists].stylists &&
      this.tabs[MyStylistsTabs.madeStylists].stylists.length > 0
    ) {
     return true;
    } else if (
      this.tabs[MyStylistsTabs.savedStylists].name === this.activeTab
      &&
      this.tabs[MyStylistsTabs.savedStylists].stylists
      && this.tabs[MyStylistsTabs.savedStylists].stylists.length > 0
    ) {
      return true;
    }

    return false;
  }

  /**
   * Split stylists list to two separate lists
   * and use it for different tabs
   * @param stylists: stylists array
   */
  splitStylistsList(stylists: PreferredStylistModel[]): void {
    // splitStylists = sorted array of two arrays
    const splitStylists = stylists.reduce((tabsObj, cur) => {
      const tab = cur.is_profile_bookable ? MyStylistsTabs.madeStylists : MyStylistsTabs.savedStylists;

      if (!tabsObj[tab]) {
        tabsObj[tab] = [];
      }

      if (tab === MyStylistsTabs.savedStylists) {
        cur.is_profile_preferred = true;
      }

      tabsObj[tab].push(cur);
      return tabsObj;
    }, []);

    // replace old list with new one
    // we need replace it (not clear and set)
    // to prevent from blinking html
    this.tabs[MyStylistsTabs.madeStylists].stylists = splitStylists[MyStylistsTabs.madeStylists];
    this.tabs[MyStylistsTabs.madeStylists].loaded = true;
    this.tabs[MyStylistsTabs.savedStylists].stylists = splitStylists[MyStylistsTabs.savedStylists];
    this.tabs[MyStylistsTabs.savedStylists].loaded = true;
  }
}
