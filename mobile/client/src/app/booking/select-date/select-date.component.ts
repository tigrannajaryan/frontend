import { Component, ViewChild } from '@angular/core';
import { AlertController, Content, Events, NavController } from 'ionic-angular';

import { Logger } from '~/shared/logger';
import { loading } from '~/shared/utils/loading';
import { DayOffer } from '~/shared/api/price.models';
import { componentIsActive } from '~/shared/utils/component-is-active';

import { PageNames } from '~/core/page-names';
import { BookingData } from '~/core/api/booking.data';
import { ClientEventTypes } from '~/core/client-event-types';

@Component({
  selector: 'select-date',
  templateUrl: 'select-date.component.html'
})
export class SelectDateComponent {
  @ViewChild(Content) content: Content;
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
        if (!this.bookingData.pricelist) {
          return;
        }

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

  onServiceChange(): void {
    // Tell the content to recalculate its dimensions. According to Ionic docs this
    // should be called after dynamically adding/removing headers, footers, or tabs.
    // See https://ionicframework.com/docs/api/components/content/Content/#resize
    if (this.content) {
      this.content.resize();
    }
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
            this.events.publish(ClientEventTypes.startBooking);
          });
        }
      }]
    });
    popup.present();
  }
}
