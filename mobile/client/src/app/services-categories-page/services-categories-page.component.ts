import { Component } from '@angular/core';
import { AlertController, Events, IonicPage, NavController, NavParams } from 'ionic-angular';
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

import { TabIndex } from '~/main-tabs/main-tabs.component';
import { EventTypes } from '~/core/event-types';

import { getPreferredStylist, startBooking } from '~/booking/booking-utils';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';

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

  isAdditionalService = false;

  constructor(
    private alertCtrl: AlertController,
    private events: Events,
    private logger: Logger,
    private navCtrl: NavController,
    private navParams: NavParams,
    private preferredStylistsData: PreferredStylistsData,
    private store: Store<ServicesState>
  ) {
  }

  async ionViewCanEnter(): Promise<boolean> {
    const preferredStylists = await this.preferredStylistsData.get({ refresh: true });

    // Cannot proceed if no prefered styllist is selected
    if (!preferredStylists || preferredStylists.length === 0) {
      setTimeout(async () => {
        await this.navCtrl.setRoot(PageNames.MainTabs);
        this.events.publish(EventTypes.selectMainTab, TabIndex.Stylists, () => {
          const alert = this.alertCtrl.create({
            message: 'Choose your saved stylist to proceed with booking.',
            buttons: [{ text: 'OK', role: 'cancel' }]
          });
          alert.present();
        });
      });
      return false;
    } else {
      return true;
    }
  }

  async ionViewWillEnter(): Promise<void> {
    this.logger.info('ServicesCategoriesPageComponent.ionViewWillEnter');

    this.isAdditionalService = Boolean(this.navParams.get('isAdditionalService'));

    const preferredStylist = await (this.isAdditionalService ? getPreferredStylist() : startBooking());
    this.stylistUuid = preferredStylist.uuid;

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
