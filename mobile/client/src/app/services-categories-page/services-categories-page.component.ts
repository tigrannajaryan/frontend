import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { PageNames } from '~/core/page-names';
import { RequestState } from '~/core/api/request.models';
import {
  GetStylistServicesAction,
  selectServicesRequestState,
  selectStylistServiceCategories,
  ServicesState
} from '~/core/reducers/services.reducer';
import { ServiceCategoryModel } from '~/core/api/services.models';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { BookingData } from '~/core/api/booking.data';

@IonicPage()
@Component({
  selector: 'page-services-categories',
  templateUrl: 'services-categories-page.component.html'
})
export class ServicesCategoriesPageComponent {
  stylistUuid: string;

  loadingCategories = Array(2).fill(undefined);

  categories: Observable<ServiceCategoryModel[]>;
  requestState: Observable<RequestState>;

  RequestState = RequestState; // expose to view

  constructor(
    private bookingData: BookingData,
    private navCtrl: NavController,
    private preferredStylistsData: PreferredStylistsData,
    private store: Store<ServicesState>
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    // Find the stylist with whom to do booking.
    const preferredStylists = await this.preferredStylistsData.get();
    if (preferredStylists.length > 0) {
      // Use the first preferred stylist (if we have any)
      this.stylistUuid = preferredStylists[0].uuid;
      this.bookingData.start(preferredStylists[0]);
    }

    this.categories = this.store.select(selectStylistServiceCategories(this.stylistUuid));
    this.requestState = this.store.select(selectServicesRequestState);

    this.store.dispatch(new GetStylistServicesAction(this.stylistUuid));
  }

  onProceedToServices(categoryUuid: string): void {
    this.navCtrl.push(PageNames.Services, { stylistUuid: this.stylistUuid, categoryUuid });
  }
}
