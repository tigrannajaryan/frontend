import { Component } from '@angular/core';
import { AlertController, Events, IonicPage, NavController } from 'ionic-angular';

import { Logger } from '~/shared/logger';
import { loading } from '~/shared/utils/loading';
import { DayOffer } from '~/shared/api/price.models';
import { componentIsActive } from '~/shared/utils/component-is-active';

import { PageNames } from '~/core/page-names';
import { BookingData } from '~/core/api/booking.data';
import { EventTypes } from '~/core/event-types';
import { TabIndex } from '~/main-tabs/main-tabs.component';

@IonicPage()
@Component({
  selector: 'select-date',
  templateUrl: 'select-date.component.html'
})
export class SelectDateComponent {
  isLoading: boolean;
  prices: DayOffer[];

  constructor(
    private alertCtrl: AlertController,
    protected bookingData: BookingData,
    private events: Events,
    private logger: Logger,
    private navCtrl: NavController
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.logger.info('SelectDateComponent.ionViewWillEnter');

    this.bookingData.selectedServicesObservable
      .takeWhile(componentIsActive(this))
      .subscribe(async () => {
        const { response } = await loading(this, this.bookingData.pricelist.get());

        if (response) {
          this.prices = response.prices;

          // When empty offers or all days of preferred stylist either booked or set to non-working:
          const notTimeslots =
            response.prices.length === 0 ||
            response.prices.every(offer => offer.is_fully_booked || !offer.is_working_day);

          if (notTimeslots) {
            this.showNoTimeSlotsPopup();
          }
        }
      });
  }

  onSelectOffer(offer: DayOffer): void {
    this.logger.info('onSelectOffer', offer);
    this.bookingData.setOffer(offer);
    this.navCtrl.push(PageNames.SelectTime);
  }

  private showNoTimeSlotsPopup(): void {
    const popup = this.alertCtrl.create({
      cssClass: 'SelectDate-notAvailablePopup',
      title: 'No time slots',
      subTitle: '🤦‍♀️',
      message: 'Unfortunately, your stylist does not have any open slots right now.',
      buttons: [{
        text: 'Show available stylists',
        role: 'cancel',
        handler: () => {
          setTimeout(async () => {
            await this.navCtrl.setRoot(PageNames.MainTabs);
            this.events.publish(EventTypes.selectMainTab, TabIndex.Stylists, tab => tab.push(PageNames.Stylists));
          });
        }
      }]
    });
    popup.present();
  }
}
