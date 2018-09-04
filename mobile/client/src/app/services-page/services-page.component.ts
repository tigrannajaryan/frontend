import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import {
  selectStylistCategory,
  selectStylistCategoryServices,
  ServicesState
} from '~/core/reducers/services.reducer';
import { ServiceCategoryModel, ServiceModel } from '~/core/api/services.models';
import { PageNames } from '~/core/page-names';
import { BookingData } from '~/core/api/booking.data';

@IonicPage()
@Component({
  selector: 'page-services',
  templateUrl: 'services-page.component.html'
})
export class ServicesPageComponent {
  category: Observable<ServiceCategoryModel>;
  services: Observable<ServiceModel[]>;

  isAdditionalService = false;

  constructor(
    protected bookingData: BookingData,
    private navCtrl: NavController,
    private navParams: NavParams,
    private store: Store<ServicesState>
  ) {
  }

  ionViewWillEnter(): void {
    const categoryUuid = this.navParams.get('categoryUuid');
    const stylistUuid = this.navParams.get('stylistUuid');

    this.isAdditionalService = Boolean(this.navParams.get('isAdditionalService'));

    this.category = this.store.select(selectStylistCategory(stylistUuid, categoryUuid));
    this.services = this.store.select(selectStylistCategoryServices(stylistUuid, categoryUuid));
  }

  onServiceClick(service: ServiceModel): void {
    // Update services:
    const services = (this.isAdditionalService ? this.bookingData.selectedServices : []) || [];
    if (!this.bookingData.hasSelectedService(service)) {
      this.bookingData.setSelectedServices([...services, service]);
    }

    if (!this.isAdditionalService) {
      this.navCtrl.push(PageNames.SelectDate);
    } else {
      const startIndex = this.navCtrl.getActive().index - 1;
      this.navCtrl.remove(startIndex, 2);
    }
  }
}
