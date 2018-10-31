import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Logger } from '~/shared/logger';

import { PageNames } from '~/core/page-names';
import { RequestState } from '~/shared/api/request.models';
import {
  GetStylistServicesAction,
  selectServicesRequestState,
  selectStylistServiceCategories,
  ServicesState
} from '~/core/reducers/services.reducer';
import { ServiceCategoryModel } from '~/core/api/services.models';

export interface ServicesCategoriesParams {
  stylistUuid: string;
  isAdditionalService?: boolean;
}

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

  isAdditionalService = false;

  constructor(
    private logger: Logger,
    private navCtrl: NavController,
    private navParams: NavParams,
    private store: Store<ServicesState>
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.logger.info('ServicesCategoriesPageComponent.ionViewWillEnter');

    const params = (this.navParams.get('params') || {}) as ServicesCategoriesParams;

    this.isAdditionalService = Boolean(params.isAdditionalService);
    this.stylistUuid = params.stylistUuid;

    this.categories = this.store.select(selectStylistServiceCategories(this.stylistUuid));
    this.requestState = this.store.select(selectServicesRequestState);

    this.store.dispatch(new GetStylistServicesAction(this.stylistUuid));
  }

  onProceedToServices(categoryUuid: string): void {
    this.navCtrl.push(PageNames.Services, {
      stylistUuid: this.stylistUuid,
      categoryUuid,
      isAdditionalService: this.isAdditionalService
    });
  }
}
