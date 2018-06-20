import * as moment from 'moment';

import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { IonicPage, NavController } from 'ionic-angular';

import { AppModule } from '~/app.module';
import { componentUnloaded } from '~/core/utils/component-unloaded';

import {
  AppointmentDatesState,
  GetDatesAction,
  SelectDateAction,
  selectDatesOffers
} from '~/appointment/appointment-date/appointment-dates.reducer';
import { selectSelectedService } from '~/appointment/appointment-services/services.reducer';
import { selectSelectedClient } from '~/appointment/appointment-add/clients.reducer';

import { AppointmentDateOffer } from '~/today/today.models';
import { Client } from '~/appointment/appointment-add/clients-models';
import { ServiceItem } from '~/core/stylist-service/stylist-models';

/**
 * Returns green if the price is less than a mid price of all prices.
 * Otherwise returns neutral color.
 */
function calculatePriceColor(prices: number[]): (price?: number) => string {
  const sanitizer = AppModule.injector.get(DomSanitizer);

  // define colors (TODO: wavelengths could be used)
  const neutral = '#000';
  const green = '#2BB14F';

  if (prices.length < 2) {
    return () => sanitizer.bypassSecurityTrustStyle(neutral);
  }

  // calculate min max
  let max = -Infinity;
  const min = prices.reduce((minPrice, price) => {
    if (price > max) {
      max = price;
    }
    return price < minPrice ? price : minPrice;
  });
  const midpoint = (min + max) / 2;

  if (min === max) {
    return () => sanitizer.bypassSecurityTrustStyle(neutral);
  }

  return (price: number): string => sanitizer.bypassSecurityTrustStyle(price < midpoint ? green : neutral);
}

@IonicPage()
@Component({
  selector: 'page-appointment-date',
  templateUrl: 'appointment-date.html'
})
export class AppointmentDateComponent {
  service?: ServiceItem;
  client?: Client;

  getPriceColor: (price?: number) => string;

  protected moment = moment;
  protected days: AppointmentDateOffer[];

  constructor(
    private navCtrl: NavController,
    private store: Store<AppointmentDatesState>
  ) {
  }

  ionViewWillLoad(): void {
    this.store
      .select(selectDatesOffers)
      .takeUntil(componentUnloaded(this))
      .subscribe(days => {
        this.days = days;

        if (days.length > 0) {
          this.getPriceColor = calculatePriceColor(days.map(day => day.price));
        }
      });

    this.store
      .combineLatest(
        this.store.select(selectSelectedService),
        this.store.select(selectSelectedClient),
        (store, service, client) => {
          this.service = service;
          this.client = client;
        }
      )
      .takeUntil(componentUnloaded(this))
      .subscribe();
  }

  ionViewDidEnter(): void {
    if (this.service) {
      this.store.dispatch(new GetDatesAction(this.service, this.client));
    }
    // TODO: if no service selected
  }

  select(date: AppointmentDateOffer): void {
    this.store.dispatch(new SelectDateAction(date));
    this.navCtrl.pop();
  }
}
