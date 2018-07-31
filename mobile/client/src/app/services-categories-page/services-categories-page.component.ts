import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PageNames } from '~/core/page-names';
import { RequestState } from '~/core/api/request.models';
import {
  GetStylistServicesAction,
  selectServicesRequestState,
  selectStylistServiceCategories,
  ServicesState
} from '~/core/reducers/services.reducer';
import { ServiceCategoryModel } from '~/core/api/services.models';

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
    private navCtrl: NavController,
    private navParams: NavParams,
    private store: Store<ServicesState>
  ) {
  }

  ionViewWillEnter(): void {
    this.stylistUuid = this.navParams.get('stylistUuid');

    this.categories = this.store.select(selectStylistServiceCategories(this.stylistUuid));
    this.requestState = this.store.select(selectServicesRequestState);

    this.store.dispatch(new GetStylistServicesAction(this.stylistUuid));
  }

  onProceedToServices(categoryUuid: string): void {
    this.navCtrl.push(PageNames.Services, { stylistUuid: this.stylistUuid, categoryUuid });
  }
}
