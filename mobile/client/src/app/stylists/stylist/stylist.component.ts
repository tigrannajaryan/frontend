import { Component } from '@angular/core';
import { App, Events, NavController, NavParams, Tab } from 'ionic-angular';

import { ExternalAppService } from '~/shared/utils/external-app-service';
import { StylistModel } from '~/shared/api/stylists.models';

import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { EventTypes } from '~/core/event-types';

import { MainTabsComponent, TabIndex } from '~/main-tabs/main-tabs.component';

export enum StylistPageType {
  Invitation,
  MyStylist,
  StylistInSearch
}

export interface StylistPageParams {
  pageType?: StylistPageType;
  stylist?: StylistModel;
}

@Component({
  selector: 'page-stylist',
  templateUrl: 'stylist.component.html'
})
export class StylistComponent {
  pageType: StylistPageType;
  stylist: StylistModel;

  // expose to the view
  StylistPageType = StylistPageType;

  constructor(
    private app: App,
    private events: Events,
    private externalAppService: ExternalAppService,
    private navCtrl: NavController,
    private navParams: NavParams,
    private preferredStylistsData: PreferredStylistsData
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    const params = (this.navParams.get('data') || {}) as StylistPageParams;

    this.pageType = params.pageType || StylistPageType.MyStylist;
    this.stylist = params.stylist;

    // Select from preferred stylists if no stylist:
    if (!this.stylist) {
      const preferredStylists = await this.preferredStylistsData.get();
      this.stylist = preferredStylists && preferredStylists[0]; // using first preferred
    }

    // Navigate to all stylists if even no preferred one:
    if (!this.stylist) {
      this.navCtrl.push(PageNames.Stylists);
    }
  }

  async onContinueWithStylist(): Promise<void> {
    await this.preferredStylistsData.set(this.stylist);

    switch (this.pageType) {
      case StylistPageType.StylistInSearch:
        if (this.navCtrl.parent && this.navCtrl instanceof Tab) {
          this.navCtrl.pop();
        } else {
          const root = this.navCtrl.getByIndex(0).component;
          await this.navCtrl.setRoot(PageNames.MainTabs);
          if (root === MainTabsComponent) { // not in onboarding flow
            this.events.publish(EventTypes.selectMainTab, TabIndex.Stylists);
          }
        }
        break;
      case StylistPageType.MyStylist:
      default:
        this.navCtrl.push(PageNames.HowMadeWorks);
    }
  }

  onProceedToStylists(): void {
    switch (this.pageType) {
      case StylistPageType.Invitation:
        // In case of onboarding and stylist invitation we proceed to PageNames.HowMadeWorks first.
        // After viewing 2 informational screens we should end up on selecting a stylist on PageNames.Stylists.
        this.navCtrl.push(PageNames.HowMadeWorks);
        break;
      case StylistPageType.MyStylist:
      default:
        // When this screen is a tab of MainTabs’ tabs proceed to Stylists directly (and as a default too):
        this.app.getRootNav().push(PageNames.Stylists);
    }
  }

  onInstagramClick(username: string): void {
    if (this.pageType === StylistPageType.MyStylist) {
      this.externalAppService.openInstagram(username);
    }
  }

  onWebsiteClick(websiteUrl: string): void {
    if (this.pageType === StylistPageType.MyStylist) {
      this.externalAppService.openWebPage(websiteUrl);
    }
  }

  onStylistPicClick(): void {
    this.events.publish(EventTypes.startBooking);
  }
}
