import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import * as moment from 'moment';

import { DayOffer, ISODate } from '~/core/api/services.models';
import { ServicesServiceMock } from '~/core/api/services-service.mock';

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

  // Expose to the view:
  Array = Array;
  moment = moment;

  constructor(
    private servicesService: ServicesServiceMock
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    // TODO: retrieve from nav params, test data:
    const params = {
      selectedServices: [],
      service: { uuid: '' }
    };

    const { response } = await this.servicesService.getPricelist({ service_uuid: params.service.uuid }).first().toPromise();
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
    // TODO: implement when connecting with other screens
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
