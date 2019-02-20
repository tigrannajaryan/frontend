import { Component } from '@angular/core';
import { AlertController, Events, NavController } from 'ionic-angular';
import { Md5 } from 'md5-typescript';

import { loading } from '~/shared/utils/loading';
import { PreferredStylistModel, StylistModel } from '~/shared/api/stylists.models';

import { ClientEventTypes } from '~/core/client-event-types';
import { PageNames } from '~/core/page-names';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

import { startBooking } from '~/booking/booking-utils';
import { MainTabIndex } from '~/main-tabs/main-tabs.component';
import { ServicesCategoriesParams } from '~/services-categories-page/services-categories-page.component';
import { removeParamsFormUrl } from '~/shared/utils/string-utils';

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
      // change redirect to stylists page when it will be ready
      this.events.publish(ClientEventTypes.selectMainTab, MainTabIndex.Home, this.showNoSelectedStylistWarning);
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

  trackByStylistIdentity(index: number, stylist: StylistModel): string {
    // all our urls has unique Signature and Expires in each request
    // override url with url without params
    stylist.profile_photo_url = removeParamsFormUrl(stylist.profile_photo_url);

    const visibleValues = [
      stylist.is_profile_bookable,
      stylist.profile_photo_url,
      stylist.salon_name,
      stylist.first_name,
      stylist.last_name,
      stylist.followers_count
    ];

    // compare all visible values
    return Md5.init(visibleValues);
  }
}
