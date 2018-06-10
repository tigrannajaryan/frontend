import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { IonicPage, NavController } from 'ionic-angular';

import { ServiceCategory, ServiceItem } from '~/core/stylist-service/stylist-models';

import {
  LoadAction,
  selectCategorisedServices,
  selectSelectedService,
  SelectServiceAction,
  ServicesState
} from './services.reducer';

@IonicPage()
@Component({
  selector: 'page-appointment-services',
  templateUrl: 'appointment-services.html'
})
export class AppointmentServicesComponent {
  categories: ServiceCategory[];
  selectedService?: ServiceItem;

  constructor(
    private navCtrl: NavController,
    private store: Store<ServicesState>
  ) {
  }

  ionViewWillLoad(): void {
    this.store
      .select(selectCategorisedServices)
      .subscribe(categories => this.categories = categories);

    this.store
      .select(selectSelectedService)
      .subscribe(service => this.selectedService = service);

    this.store.dispatch(new LoadAction());
  }

  selectService(service): void {
    this.store.dispatch(new SelectServiceAction(service));
    this.navCtrl.pop();
  }
}
