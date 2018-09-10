import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { StylistModel } from '~/core/api/stylists.models';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

export enum StylistPageType {
  MyStylist,
  Invitation
}

@IonicPage()
@Component({
  selector: 'page-stylist-invitation',
  templateUrl: 'stylist-invitation.component.html'
})
export class StylistInvitationPageComponent {
  pageType: StylistPageType;
  stylist: StylistModel;

  StylistPageType = StylistPageType;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private preferredStylistsData: PreferredStylistsData
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.pageType = this.navParams.get('pageType') || StylistPageType.MyStylist;
    this.stylist = this.navParams.get('stylist');

    // Select from preferred stylists:
    if (!this.stylist) {
      const preferredStylists = await this.preferredStylistsData.get();
      this.stylist = preferredStylists && preferredStylists[0]; // using first preferred
    }

    // Navigate to all stylists if no preferred ones:
    if (!this.stylist) {
      this.navCtrl.push(PageNames.Stylists);
    }
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
        this.navCtrl.push(PageNames.Stylists);
    }
  }
}
