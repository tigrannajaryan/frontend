import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { PageNames } from '~/core/page-names';
import { StylistModel } from '~/core/api/stylists.models';
import { selectInvitedByStylist, StylistState } from '~/core/reducers/stylists.reducer';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

@IonicPage()
@Component({
  selector: 'page-stylist-invitation',
  templateUrl: 'stylist-invitation-page.component.html'
})
export class StylistInvitationPageComponent {
  stylist: StylistModel;

  constructor(
    private navCtrl: NavController,
    private preferredStylistsData: PreferredStylistsData,
    private store: Store<StylistState>
  ) {
  }

  async ionViewCanEnter(): Promise<boolean> {
    const preferredStylists = await this.preferredStylistsData.get();
    if (preferredStylists.length !== 0) {
      // Redirect to Home when has a preferred stylist.
      // This can be an indicator of already passed onboarding.
      setTimeout(() => {
        this.navCtrl.setRoot(PageNames.MainTabs);
      });
      return false;
    }
    return true;
  }

  async ionViewWillEnter(): Promise<void> {
    this.stylist = await this.store.select(selectInvitedByStylist).first().toPromise();
  }

  async onContinueWithStylist(): Promise<void> {
    await this.preferredStylistsData.set(this.stylist);

    this.navCtrl.push(PageNames.HowMadeWorks);
  }

  async onSeeStylistsList(): Promise<void> {
    this.navCtrl.push(PageNames.HowMadeWorks);
  }
}
