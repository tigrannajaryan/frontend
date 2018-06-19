import * as moment from 'moment';

import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { IonicPage, NavController } from 'ionic-angular';

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

@IonicPage()
@Component({
  selector: 'page-appointment-date',
  templateUrl: 'appointment-date.html'
})
export class AppointmentDateComponent {
  service?: ServiceItem;
  client?: Client;

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
