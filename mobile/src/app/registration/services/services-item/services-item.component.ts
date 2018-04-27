import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, ModalController, NavController, NavParams } from 'ionic-angular';

import { BaseComponent } from '../../../../helpers/base-component';
import { ServiceTemplateSet } from '../../../../providers/stylist-service/stylist-models';
import { StoreService } from '../../../../providers/store/store';
import { StylistServiceProvider } from '../../../../providers/stylist-service/stylist-service';
import { Store } from '../../../../providers/store/store-model';
import { PageNames } from '../../../../pages/page-names';
import {StoreServiceHelper} from '../../../../providers/store/store-helper';

// this need for saving uuid (page refresh will not remove it)
@IonicPage({
  segment: 'services/:uuid'
})
@Component({
  selector: 'page-services-item',
  templateUrl: 'services-item.component.html'
})
export class ServicesItemComponent extends BaseComponent {
  uuid: number;
  timeGap = 15;
  templateSet: ServiceTemplateSet;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private store: StoreService,
    private stylistService: StylistServiceProvider,
    private storeHelper: StoreServiceHelper
  ) {
    super();
    this.init();
  }

  async init(): Promise<any> {
    this.uuid = this.navParams.get('uuid');

    if (this.uuid) {
      // call api
      await this.stylistService.getServiceTemplateById(this.uuid);
      // get fresh data
      this.store.changes.safeSubscribe(this, (res: Store) => {
        this.templateSet = res.template_set;
      });
    }
  }

  convertMinsToHrsMins(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return `${h}h ${m < 10 ? '0' : ''}${m} m`;
  }

  openService(srv?, cat?): void {
    const profileModal = this.modalCtrl.create(PageNames.RegisterServicesItemAdd, {
      data: {
        service: srv,
        categoryUuid: cat ? cat.uuid : undefined
      }
    });
    profileModal.present();
  }

  saveChanges(): void {
    const categoriesServices = [];

    for (let i = 0; i < this.templateSet.categories.length; i++) {
      const curCategory = this.templateSet.categories[i];

      for (let j = 0; j < curCategory.services.length; j++) {
        const curServices = curCategory.services[j];

        let services = {
          name: curServices.name,
          description: curServices.description,
          base_price: +curServices.base_price,
          duration_minutes: +curServices.duration_minutes,
          is_enabled: true,
          category_uuid: curCategory.uuid
        };

        categoriesServices.push(services);
      }
    }

    try {
      // Show loader
      let loading = this.loadingCtrl.create();
      loading.present();

      this.stylistService.setStylistServices(categoriesServices).then(() => {
        loading.dismiss();
      });
    } catch (e) {
      // Show an error message
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: e,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }

  resetList(): void {
    this.storeHelper.update('template_set', []);
  }
}
