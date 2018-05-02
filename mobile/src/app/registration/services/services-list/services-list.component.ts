import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, ModalController, NavController, NavParams } from 'ionic-angular';

import { BaseComponent } from '../../../../helpers/base-component';
import { ServiceTemplateSet } from '../../../../providers/stylist-service/stylist-models';
import { StoreService } from '../../../../providers/store/store';
import { StylistServiceProvider } from '../../../../providers/stylist-service/stylist-service';
import { ServiceTemplateSetResponse } from '../../../../providers/store/store-model';
import { PageNames } from '../../../../pages/page-names';
import { StoreServiceHelper } from '../../../../providers/store/store-helper';

// this is required for saving uuid (page refresh will not remove it)
@IonicPage({
  segment: 'services/:uuid'
})
@Component({
  selector: 'page-services-list',
  templateUrl: 'services-list.component.html'
})
export class ServicesListComponent extends BaseComponent {
  uuid: string;
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
      await this.stylistService.getServiceTemplateSetById(this.uuid);
      // get fresh data
      this.store.changes.safeSubscribe(this, (res: ServiceTemplateSetResponse) => {
        this.templateSet = res.template_set;
      });
    }
  }

  /**
   * It get number in minutes and return converted string
   * input: 60
   * output: 1h 0m
   */
  convertMinsToHrsMins(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return `${h}h ${m < 10 ? '0' : ''}${m}m`;
  }

  openServiceModal(srv?, cat?): void {
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

    for (const curCategory of this.templateSet.categories) {
      for (const curServices of curCategory.services) {
        categoriesServices.push({
          name: curServices.name,
          description: curServices.description,
          base_price: +curServices.base_price,
          duration_minutes: +curServices.duration_minutes,
          is_enabled: true,
          category_uuid: curCategory.uuid
        });
      }
    }

    try {
      // Show loader
      const loading = this.loadingCtrl.create();
      loading.present();

      this.stylistService.setStylistServices(categoriesServices)
        .then(() => {
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
