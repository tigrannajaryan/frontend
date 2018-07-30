import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PageNames } from '~/core/page-names';
import {
  GetStylistServicesAction,
  selectStylistServiceCategories,
  ServicesState
} from '~/core/reducers/services.reducer';
import { ServiceCategoryModel } from '~/core/api/services.models';

@IonicPage()
@Component({
  selector: 'page-categories',
  templateUrl: 'categories-page.component.html'
})
export class CategoriesPageComponent {
  stylistUuid: string;

  categories: Observable<ServiceCategoryModel[]>;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private store: Store<ServicesState>
  ) {
  }

  ionViewWillEnter(): void {
    this.stylistUuid = this.navParams.get('stylistUuid');

    this.categories = this.store.select(selectStylistServiceCategories(this.stylistUuid));

    this.store.dispatch(new GetStylistServicesAction(this.stylistUuid));
  }

  proceedToServices(categoryUuid: string): void {
    this.navCtrl.push(PageNames.Services, { stylistUuid: this.stylistUuid, categoryUuid });
  }
}
