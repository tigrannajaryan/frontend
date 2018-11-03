import { Component } from '@angular/core';
import { AlertController, Events, NavController } from 'ionic-angular';

import { loading } from '~/shared/utils/loading';
import { PreferredStylistModel } from '~/shared/api/stylists.models';

import { ClientEventTypes } from '~/core/client-event-types';
import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

import { startBooking } from '~/booking/booking-utils';
import { TabIndex } from '~/main-tabs/main-tabs.component';
import { ServicesCategoriesParams } from '~/services-categories-page/services-categories-page.component';

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

    // Show only bookable stylists:
    this.stylists = this.stylists.filter(stylist => stylist.is_profile_bookable);

    if (this.stylists.length === 0) {
      // Cannot proceed if no prefered bookable styllist is selected.
      // Redirecting to Stylists tab and showing a warning popup:
      await this.navCtrl.setRoot(PageNames.MainTabs);
      this.events.publish(ClientEventTypes.selectMainTab, TabIndex.Stylists, this.showNoSelectedStylistWarning);
    }
  }

  async onContinueWithStylist(stylistUuid: string): Promise<void> {
    await startBooking(stylistUuid);

    const params: ServicesCategoriesParams = { stylistUuid };
    this.navCtrl.push(PageNames.ServicesCategories, { params });
  }

  /**
   * If no preferred bookable stylist is selected we redirect a user to the Stylist tab and show a popup with a warning message.
   * A user should select a stylist first to proceed with the booking.
   */
  showNoSelectedStylistWarning = (): void => {
    const alert = this.alertCtrl.create({
      message: 'Choose your stylists to proceed with booking.',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    alert.present();
  };
}
