import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { PageNames } from '~/core/page-names';
import { componentIsActive } from '~/core/utils/component-is-active';

import { StylistModel } from '~/core/api/stylists.models';
import { selectInvitedByStylist, StylistState } from '~/core/reducers/stylists.reducer';

@IonicPage()
@Component({
  selector: 'page-stylist-invitation',
  templateUrl: 'stylist-invitation-page.component.html'
})
export class StylistInvitationPageComponent {
  stylist: StylistModel;

  constructor(
    private navCtrl: NavController,
    private store: Store<StylistState>
  ) {
  }

  ionViewCanEnter(): Promise<boolean> {
    return this.store.select(selectInvitedByStylist)
      .first()
      .map((invitation?: StylistModel) => {
        this.stylist = invitation;
        if (!this.stylist) { // should pick a stylist first
          setTimeout(() => {
            this.navCtrl.setRoot(PageNames.Stylists);
          });
        }
        return Boolean(this.stylist);
      })
      .toPromise();
  }

  continueWithStylist(): void {
    // TODO: uncomment after adding services pages
    // this.navCtrl.push(PageNames.Categories, { stylistUuid: this.stylist.uuid });
  }

  seeStylistsList(): void {
    this.navCtrl.push(PageNames.Stylists);
  }
}
