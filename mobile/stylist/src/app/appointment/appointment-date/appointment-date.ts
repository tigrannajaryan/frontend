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

export const neutralColor = 'rgb(0, 0, 0)';
export const greenColor = 'rgb(43, 177, 79)';

/**
 * Returns green if the price is less than a mid price of all prices.
 * Otherwise returns neutral color.
 */
function calculatePriceColor(prices: number[]): (price?: number) => string {
  const sanitizer = AppModule.injector.get(DomSanitizer);

  if (prices.length < 2) {
    return () => sanitizer.bypassSecurityTrustStyle(neutralColor);
  }

  // calculate min max
  let max = prices[0];
  const min = prices.reduce((minPrice, price) => {
    if (price > max) {
      max = price;
    }
    return price < minPrice ? price : minPrice;
  });
  const midpoint = (min + max) / 2;

  if (min === max) {
    return () => sanitizer.bypassSecurityTrustStyle(neutralColor);
  }

  return (price: number): string => sanitizer.bypassSecurityTrustStyle(price < midpoint ? greenColor : neutralColor);
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
      .select(selectSelectedService)
      .takeUntil(componentUnloaded(this))
      .subscribe(service => {
        this.service = service;
      });

    this.store
      .select(selectSelectedClient)
      .takeUntil(componentUnloaded(this))
      .subscribe(client => {
        this.client = client;
      });
  }

  ionViewDidEnter(): void {
    if (this.service) {
      this.store.dispatch(new GetDatesAction(this.service, this.client));
    } else {
      // This page should be used only when a service is already selected.
      // The opposite case should be considered mostly unrechable. JIC:
      throw new Error('Service is undefined');
    }
  }

  select(date: AppointmentDateOffer): void {
    this.store.dispatch(new SelectDateAction(date));
    this.navCtrl.pop();
  }
}
