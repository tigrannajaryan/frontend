import { Component } from '@angular/core';
import { IonicPage, Tab } from 'ionic-angular';

import { GAWrapper } from '~/shared/google-analytics';
import { PageNames } from '~/core/page-names';

interface TabsObject {
  name: string;
  link: PageNames; // should be PageNames when we will have all pages
  params: any;
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
      link: PageNames.Stylists,
      params: { isMain: true }
    },
    {
      name: 'Book',
      link: PageNames.Stylists,
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

  private lastSubsrciption: any;

  constructor(
    private ga: GAWrapper
  ) {
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
