import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { FieldErrorItem } from '~/shared/api-errors';
import { hasError } from '~/shared/pipes/has-error.pipe';

import { PageNames } from '~/core/page-names';
import { StylistModel } from '~/core/api/stylists.models';
import { selectInvitedByStylist, StylistState } from '~/core/reducers/stylists.reducer';
import { StylistsService } from '~/core/api/stylists-service';

@IonicPage()
@Component({
  selector: 'page-stylist-invitation',
  templateUrl: 'stylist-invitation-page.component.html'
})
export class StylistInvitationPageComponent {
  stylist: StylistModel;

  constructor(
    private navCtrl: NavController,
    private stylistsService: StylistsService,
    private store: Store<StylistState>
  ) {
  }

  ionViewCanEnter(): Promise<boolean> {
    return this.store.select(selectInvitedByStylist)
      .map((invitation?: StylistModel) => {
        this.stylist = invitation;
        if (!this.stylist) { // should pick a stylist first
          setTimeout(() => {
            this.navCtrl.setRoot(PageNames.Stylists);
          });
        }
        return Boolean(this.stylist);
      })
      .first()
      .toPromise();
  }

  async onContinueWithStylist(): Promise<void> {
    const { response, error } = await this.stylistsService.setPreferredStylist(this.stylist.uuid).first().toPromise();
    if (response || error && hasError(error, new FieldErrorItem('stylist_uuid', { code: 'err_stylist_is_already_in_preference' }))) {
      this.navCtrl.push(PageNames.MainTabs);
    }
  }

  onSeeStylistsList(): void {
    this.navCtrl.push(PageNames.Stylists);
  }
}
