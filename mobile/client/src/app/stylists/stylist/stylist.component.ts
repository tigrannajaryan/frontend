import { Component } from '@angular/core';
import { App, Events, NavController, NavParams } from 'ionic-angular';
import { LaunchNavigator } from '@ionic-native/launch-navigator';

import { ExternalAppService } from '~/shared/utils/external-app-service';
import { PreferredStylistModel, StylistModel } from '~/shared/api/stylists.models';

import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { EventTypes } from '~/core/event-types';

export enum StylistsEvents {
  ReloadMyStylist = 'ReloadMyStylist'
}

export enum StylistPageType {
  Invitation = 1,
  MyStylist
}

export interface StylistPageParams {
  pageType?: StylistPageType;
  stylist?: StylistModel;
  onboarding?: boolean;
}

@Component({
  selector: 'page-stylist',
  templateUrl: 'stylist.component.html'
})
export class StylistComponent {
  pageType: StylistPageType;
  stylist: StylistModel;

  PageNames = PageNames;

  // Indicates that we are inside onboarding flow:
  onboarding = false;

  // expose to the view
  StylistPageType = StylistPageType;

  constructor(
    private app: App,
    private events: Events,
    private externalAppService: ExternalAppService,
    private launchNavigator: LaunchNavigator,
    private navCtrl: NavController,
    private navParams: NavParams,
    private preferredStylistsData: PreferredStylistsData
  ) {
  }

  ionViewWillLoad(): void {
    this.events.subscribe(StylistsEvents.ReloadMyStylist, async () => {
      this.stylist = await this.getPreferredStylist();
    });
  }

  async ionViewWillEnter(): Promise<void> {
    const params = (this.navParams.get('data') || {}) as StylistPageParams;

    this.pageType = params.pageType || StylistPageType.MyStylist;
    this.stylist = params.stylist;
    this.onboarding = params.onboarding;

    // Select from preferred stylists if no stylist:
    if (!this.stylist) {
      this.stylist = await this.getPreferredStylist();
    }

    // Navigate to all stylists if even no preferred one:
    if (!this.stylist) {
      this.navCtrl.push(PageNames.Stylists);
    }
  }

  ionViewWillUnload(): void {
    this.events.unsubscribe(StylistsEvents.ReloadMyStylist);
  }

  async onContinueWithStylist(): Promise<void> {
    await this.preferredStylistsData.set(this.stylist);
    this.navCtrl.push(PageNames.HowMadeWorks);
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
    if (this.pageType !== StylistPageType.Invitation) {
      this.externalAppService.openInstagram(username);
    }
  }

  onWebsiteClick(websiteUrl: string): void {
    if (this.pageType !== StylistPageType.Invitation) {
      this.externalAppService.openWebPage(websiteUrl);
    }
  }

  onAddressClick(address: string): void {
    if (this.pageType !== StylistPageType.Invitation) {
      this.externalAppService.openAddress(this.launchNavigator, address);
    }
  }

  onStylistPicClick(): void {
    this.events.publish(EventTypes.startBooking);
  }

  private async getPreferredStylist(): Promise<PreferredStylistModel> {
    const preferredStylists = await this.preferredStylistsData.get();
    return preferredStylists && preferredStylists[0]; // using first preferred
  }
}
