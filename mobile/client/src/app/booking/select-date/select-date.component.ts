import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import { PageNames } from '~/core/page-names';
import { DayOffer, ISODate } from '~/core/api/services.models';
import { BookingData } from '~/core/api/booking.data';
import { loading } from '~/core/utils/loading';

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
  moment = moment;

  constructor(
    protected bookingData: BookingData,
    private logger: Logger,
    private navCtrl: NavController
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.logger.info('SelectDateComponent.ionViewWillEnter');

    const { response } = await loading(this, this.bookingData.pricelist.get());
    if (response && response.prices.length > 0) {

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

  onSelectOffer(offer: DayOffer): void {
    this.logger.info('onSelectOffer', offer);

    const date = moment(offer.date);
    this.bookingData.setDate(date);
    this.bookingData.setTotalClientPrice(offer.price);

    this.navCtrl.push(PageNames.SelectTime);
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
