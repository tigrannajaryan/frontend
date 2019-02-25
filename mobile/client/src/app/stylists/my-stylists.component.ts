import { Component, ViewChild } from '@angular/core';
import { App, Events, NavController, Refresher, Slides } from 'ionic-angular';
import { Md5 } from 'md5-typescript';

import {
  PreferredStylistModel,
  PreferredStylistsListResponse,
  StylistModel
} from '~/shared/api/stylists.models';
import { componentUnloaded } from '~/shared/component-unloaded';
import { StylistProfileParams } from '~/stylists/stylist-profile/stylist-profile.component';
import { ApiResponse } from '~/shared/api/base.models';

import { ClientEventTypes } from '~/core/client-event-types';
import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { removeParamsFormUrl } from '~/shared/utils/string-utils';

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
    public app: App,
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

      cur.is_profile_preferred = true;

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

  openStylistPreview(stylist: PreferredStylistModel): void {
    const params: StylistProfileParams = {
      stylist
    };

    this.app.getRootNav().push(PageNames.StylistProfile, { params });
  }

  trackByStylistIdentity(index: number, stylist: StylistModel): string {
    // all our urls has unique Signature and Expires in each request
    // override url with url without params
    stylist.profile_photo_url = removeParamsFormUrl(stylist.profile_photo_url);

    const visibleValues = [
      stylist.is_profile_bookable,
      stylist.profile_photo_url,
      stylist.salon_name,
      stylist.first_name,
      stylist.last_name,
      stylist.followers_count
    ];

    // compare all visible values
    return Md5.init(visibleValues);
  }
}
