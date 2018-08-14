import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
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
import { StylistsService } from '~/core/api/stylists-service';

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
    private stylistsService: StylistsService,
    private store: Store<ServicesState>
  ) {
  }

  async ionViewCanEnter(): Promise<boolean> {
    return this.stylistsService.getPreferredStylists()
      .map(({ response }) => {
        if (!response.stylists || response.stylists.length === 0) {
          // Can happen when exiting the app before selecting a preferred stylist.
          // TODO: remove after implementing restore to last viewed screen (onboarding)
          setTimeout(() => {
            this.navCtrl.setRoot(PageNames.Stylists);
          });
          return false;
        }
        // For the Client App V1 we have only one preferred Stylist:
        this.stylistUuid = response.stylists[0].uuid;
        return true;
      })
      .first()
      .toPromise();
  }

  ionViewWillEnter(): void {
    this.categories = this.store.select(selectStylistServiceCategories(this.stylistUuid));
    this.requestState = this.store.select(selectServicesRequestState);

    this.store.dispatch(new GetStylistServicesAction(this.stylistUuid));
  }

  onProceedToServices(categoryUuid: string): void {
    this.navCtrl.push(PageNames.Services, { stylistUuid: this.stylistUuid, categoryUuid });
  }
}
