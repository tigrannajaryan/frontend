import { Component } from '@angular/core';
import { AlertController, Events, IonicPage, NavController } from 'ionic-angular';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import { loading } from '~/shared/utils/loading';

import { PageNames } from '~/core/page-names';
import { DayOffer, ISODate } from '~/core/api/services.models';
import { BookingData } from '~/core/api/booking.data';
import { componentIsActive } from '~/core/utils/component-is-active';

import { EventTypes } from '~/core/event-types';
import { TabIndex } from '~/main-tabs/main-tabs.component';

interface ExtendedDayOffer extends DayOffer {
  opacity: number;
}

@IonicPage()
@Component({
  selector: 'select-date',
  templateUrl: 'select-date.component.html'
})
export class SelectDateComponent {
  offers: Map<ISODate, ExtendedDayOffer>;

  start: ISODate;
  end: ISODate;

  isLoading: boolean;

  // Expose to the view:
  Array = Array;
  Math = Math;
  moment = moment;

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
          // When empty offers or all days of preferred stylist either booked or set to non-working:
          const notTimeslots =
            response.prices.length === 0 ||
            response.prices.every(offer => offer.is_fully_booked || !offer.is_working_day);

          if (notTimeslots) {
            this.showNoTimeSlotsPopup();

          } else {
            // Create offers Map {[ISODate]: DayOffer} to easily get an offer by date:
            this.offers = new Map();
            for (const offer of getPricesWithOpacity(response.prices)) {
              this.offers.set(offer.date, offer);
            }

            // Set period boundaries to understand what months of calendar to create:
            this.start = moment(response.prices[0].date).startOf('month').format('YYYY-MM-DD');
            this.end = moment(response.prices[response.prices.length - 1].date).endOf('month').format('YYYY-MM-DD');
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

function getPricesWithOpacity(offers: DayOffer[], threshold = 0.2): ExtendedDayOffer[] {
  if (offers.length === 0) {
    return;
  }
  if (offers.length <= 2) {
    return offers.map((offer: DayOffer) => ({
      ...offer,
      opacity: undefined
    }));
  }
  let min = offers[0].price;
  const max = offers.slice(1).reduce((a: DayOffer, b: DayOffer) => {
    if (b.price < min) {
      min = b.price;
    }
    if (a.price > b.price) {
      return a;
    } else {
      return b;
    }
  }).price;
  const middle = (min + max) / 2;
  return offers.map((offer: DayOffer) => ({
    ...offer,
    opacity: offer.price <= middle ? 1 - (offer.price - min) / (middle - min) + threshold : undefined
  }));
}
