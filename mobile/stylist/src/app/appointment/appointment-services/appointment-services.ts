import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { IonicPage, NavController } from 'ionic-angular';

import { componentUnloaded } from '~/shared/component-unloaded';
import { ServiceCategory, ServiceItem } from '~/core/api/stylist-service/stylist.models';

import {
  LoadAction,
  selectCategorisedServices,
  selectSelectedService,
  SelectServiceAction,
  ServicesState
} from '../../core/reducers/services.reducer';

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
      .takeUntil(componentUnloaded(this))
      .subscribe(categories => this.categories = categories);

    this.store
      .select(selectSelectedService)
      .takeUntil(componentUnloaded(this))
      .subscribe(service => this.selectedService = service);

    this.store.dispatch(new LoadAction());
  }

  selectService(service: ServiceItem): void {
    this.store.dispatch(new SelectServiceAction(service));
    this.navCtrl.pop();
  }
}
