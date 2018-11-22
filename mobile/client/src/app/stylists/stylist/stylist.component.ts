import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { StylistModel } from '~/shared/api/stylists.models';

import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

export interface StylistInvitationParams {
  stylist?: StylistModel;
}

/**
 * This screen show stylist invitation during onboarding (if it exists).
 */
@Component({
  selector: 'page-stylist',
  templateUrl: 'stylist.component.html'
})
export class StylistComponent {
  stylist: StylistModel;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private preferredStylistsData: PreferredStylistsData
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    const params = (this.navParams.get('data') || {}) as StylistInvitationParams;
    this.stylist = params.stylist;
  }

  /**
   * Save stylist as a preferred one and proceed.
   */
  async onContinueWithStylist(): Promise<void> {
    await this.preferredStylistsData.addStylist(this.stylist);
    this.navCtrl.push(PageNames.HowMadeWorks);
  }

  /**
   * Proceed without saving. After informational screens a user will be redirected
   * to the stylists search to select a preferred stylist.
   */
  onNotMyStylist(): void {
    this.navCtrl.push(PageNames.HowMadeWorks);
  }
}
