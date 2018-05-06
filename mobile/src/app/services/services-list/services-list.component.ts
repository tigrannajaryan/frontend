import { Component } from '@angular/core';
import {
  AlertController,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';

import {
  ServiceCategory,
  ServiceTemplateItem,
  ServiceTemplateSet
} from '../../shared/stylist-service/stylist-models';

import { StylistServiceProvider } from '../../shared/stylist-service/stylist-service';
import { PageNames } from '../../shared/page-names';
import { ServiceItemComponentData } from '../services-item/services-item.component';

import * as time from '../../shared/time';

// this is required for saving uuid (page refresh will not remove it)
@IonicPage({ segment: 'services/:uuid' })
@Component({
  selector: 'page-services-list',
  templateUrl: 'services-list.component.html'
})
export class ServicesListComponent {
  uuid: string;
  timeGap = 15;
  templateSet: ServiceTemplateSet;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private stylistService: StylistServiceProvider
  ) {
    this.init();
  }

  async init(): Promise<any> {
    this.uuid = this.navParams.get('uuid');

    if (this.uuid) {
      const response = await this.stylistService.getServiceTemplateSetById(this.uuid);
      this.templateSet = response.template_set;
    }
  }

  /**
   * Shows the service item form as a modal.
   * @param category the category if the service to preselect in the form
   * @param service if omitted indicates that a new service is being created
   */
  openServiceModal(category: ServiceCategory, service?: ServiceTemplateItem): void {
    const itemToEdit: ServiceItemComponentData = {
      categories: this.templateSet.categories,
      service,
      categoryUuid: category ? category.uuid : undefined
    };

    const profileModal = this.modalCtrl.create(PageNames.RegisterServicesItemAdd,
      {
        data: itemToEdit
      });
    profileModal.onDidDismiss(editedItem => {
      this.updateServiceItem(itemToEdit, editedItem);
    });
    profileModal.present();
  }

  async saveChanges(): Promise<void> {
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

      try {
        await this.stylistService.setStylistServices(categoriesServices);
        this.navCtrl.push(PageNames.Worktime);
      } finally {
        loading.dismiss();
      }
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

  /**
   * Reset the list of services to its initial state.
   */
  resetList(): void {
    this.init();
  }

  convertMinsToHrsMins(mins: number): string {
    return time.convertMinsToHrsMins(mins);
  }

  /**
   * Process the results of modal service item form.
   * @param itemToEdit original item that we asked the form to edit (empty means new item)
   * @param editedItem the resulting item with data entered by the user (empty means delete was requested by the user)
   */
  private updateServiceItem(itemToEdit: ServiceItemComponentData, editedItem: ServiceItemComponentData): void {
    if (!editedItem) {
      // No new data. Most likely just pressed Back. Nothing to do.
      return;
    }

    // Find old item
    let categoryIndex = this.templateSet.categories.findIndex(x => x.uuid === itemToEdit.categoryUuid);
    let category: ServiceCategory = this.templateSet.categories[categoryIndex];
    let serviceIndex: number = itemToEdit.service ? category.services.findIndex(x => x.id === itemToEdit.service.id) : -1;

    if (itemToEdit.categoryUuid !== editedItem.categoryUuid) {
      // Remove from old category
      if (serviceIndex !== -1) {
        category.services.splice(serviceIndex, 1);
      }

      // Edit item not empty (indicates deletion if it is empty)
      if (editedItem.service) {
        // Not empty. Add to new category.
        categoryIndex = this.templateSet.categories.findIndex(x => x.uuid === editedItem.categoryUuid);
        category = this.templateSet.categories[categoryIndex];
        category.services.push(editedItem.service);
      }
    } else {
      // Update the service item
      if (serviceIndex === -1) {
        // this is a new item, append at the end
        serviceIndex = category.services.length;
      }
      category.services[serviceIndex] = editedItem.service;
    }
  }
}
