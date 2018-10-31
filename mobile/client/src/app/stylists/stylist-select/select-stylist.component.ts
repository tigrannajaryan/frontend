import { Component } from '@angular/core';
import { AlertController, Events, NavController } from 'ionic-angular';

import { loading } from '~/shared/utils/loading';
import { PreferredStylistModel } from '~/shared/api/stylists.models';

import { EventTypes } from '~/core/event-types';
import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

import { startBooking } from '~/booking/booking-utils';
import { TabIndex } from '~/main-tabs/main-tabs.component';

@Component({
  selector: 'select-stylist',
  templateUrl: 'select-stylist.component.html'
})
export class SelectStylistComponent {
  stylists: PreferredStylistModel[];

  isLoading = false;
  loadingStylists = Array(2).fill(undefined);

  constructor(
    private alertCtrl: AlertController,
    private events: Events,
    private navCtrl: NavController,
    private preferredStylistsData: PreferredStylistsData
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.stylists = await loading(this, this.preferredStylistsData.get());

    if (!this.stylists || this.stylists.length === 0) {
      // Cannot proceed if no prefered styllist is selected, redirecting:
      await this.navCtrl.setRoot(PageNames.MainTabs);
      this.events.publish(EventTypes.selectMainTab, TabIndex.Stylists, () => {
        const alert = this.alertCtrl.create({
          message: 'Choose your stylists to proceed with booking.',
          buttons: [{ text: 'OK', role: 'cancel' }]
        });
        alert.present();
      });
    }
  }

  async onContinueWithStylist(stylistUuid: string): Promise<void> {
    await startBooking(stylistUuid);
    this.navCtrl.push(PageNames.ServicesCategories, { stylistUuid });
  }
}
