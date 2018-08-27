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
import { startBooking } from '~/booking/booking-utils';
import { Logger } from '~/shared/logger';

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
    private logger: Logger,
    private navCtrl: NavController,
    private store: Store<ServicesState>
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.logger.info('ServicesCategoriesPageComponent.ionViewWillEnter');

    const preferredStylist = await startBooking();
    this.stylistUuid = preferredStylist.uuid;

    this.categories = this.store.select(selectStylistServiceCategories(this.stylistUuid));
    this.requestState = this.store.select(selectServicesRequestState);

    this.store.dispatch(new GetStylistServicesAction(this.stylistUuid));
  }

  onProceedToServices(categoryUuid: string): void {
    this.navCtrl.push(PageNames.Services, { stylistUuid: this.stylistUuid, categoryUuid });
  }
}
