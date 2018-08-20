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

  constructor(
    private bookingData: BookingData,
    private navCtrl: NavController,
    private navParams: NavParams,
    private store: Store<ServicesState>
  ) {
  }

  ionViewWillEnter(): void {
    const categoryUuid = this.navParams.get('categoryUuid');
    const stylistUuid = this.navParams.get('stylistUuid');

    this.category = this.store.select(selectStylistCategory(stylistUuid, categoryUuid));
    this.services = this.store.select(selectStylistCategoryServices(stylistUuid, categoryUuid));
  }

  onServiceClick(service: ServiceModel): void {
    this.bookingData.setSelectedServices([service]);
    this.navCtrl.push(PageNames.SelectDate);
  }
}
