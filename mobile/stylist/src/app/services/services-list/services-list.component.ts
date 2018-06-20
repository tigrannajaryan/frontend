import { Component } from '@angular/core';
import {
  IonicPage,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';

import {
  ServiceCategory,
  ServiceTemplateItem,
  ServiceTemplateSet
} from '~/core/stylist-service/stylist-models';

import { loading } from '~/core/utils/loading';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { PageNames } from '~/core/page-names';
import { ServiceItemComponentData } from '../services-item/services-item.component';

import * as time from '~/shared/time';
import { showAlert } from '~/core/utils/alert';
import { ServiceListType } from '~/services/services.component';

// this is required for saving uuid (page refresh will not remove it)
@IonicPage({ segment: 'services/:uuid' })
@Component({
  selector: 'page-services-list',
  templateUrl: 'services-list.component.html'
})
export class ServicesListComponent {
  protected PageNames = PageNames;
  protected categories: ServiceCategory[] = [];
  protected isEmptyCategories = false;
  protected isProfile?: Boolean;
  protected templateSet: ServiceTemplateSet;
  protected timeGap = 30;

  static checkIfEmptyCategories(categories: ServiceCategory[]): boolean {
    return categories.every((cat: ServiceCategory) => {
      return cat.services.length === 0;
    });
  }

  static buildBlankCategoriesList(serviceCategory: ServiceCategory[]): ServiceCategory[] {
    for (const category of serviceCategory) {
      category.services = [];
    }
    return serviceCategory;
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private stylistService: StylistServiceProvider
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    this.isProfile = Boolean(this.navParams.get('isProfile'));
    this.loadInitialData();
  }

  @loading
  async loadInitialData(): Promise<void> {
    try {
      const uuid = this.navParams.get('uuid');
      let response;

      if (uuid && uuid !== ServiceListType.blank) {
        response = await this.stylistService.getServiceTemplateSetByUuid(uuid);
      } else if (uuid === ServiceListType.blank) {
        response = await this.stylistService.getStylistServices();
        response.categories = ServicesListComponent.buildBlankCategoriesList(response.categories);
      } else {
        response = await this.stylistService.getStylistServices();
      }
      this.categories = response.categories;
      this.timeGap = response.service_time_gap_minutes;
      this.isEmptyCategories = ServicesListComponent.checkIfEmptyCategories(this.categories);
    } catch (e) {
      showAlert('Loading services failed', e.message);
    }
  }

  /**
   * Shows the service item form as a modal.
   * @param category the category if the service to preselect in the form
   * @param service if omitted indicates that a new service is being created
   */
  openServiceModal(category: ServiceCategory, service?: ServiceTemplateItem): void {
    const itemToEdit: ServiceItemComponentData = {
      categories: this.categories,
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

  @loading
  async saveChanges(): Promise<void> {
    const categoriesServices =
      this.categories.reduce((services, category) => (
        services.concat(
          category.services.map(service => ({
            ...service,
            is_enabled: true,
            category_uuid: category.uuid
          }))
        )
      ), []);

    if (categoriesServices.length === 0) {
      showAlert('Services are empty', 'At least one service should be added.');
      return;
    }

    try {
      await this.stylistService.setStylistServices({
        services: categoriesServices,
        service_time_gap_minutes: this.timeGap
      });
      if (this.isProfile) {
        this.navCtrl.pop();
      } else {
        this.navCtrl.push(PageNames.Worktime);
      }
    } catch (e) {
      // Show an error message
      showAlert('Error', e);
    }
  }

  /**
   * Reset the list of services to its initial state.
   */
  resetList(): void {
    this.ionViewWillLoad();
  }

  convertMinsToHrsMins(mins: number): string {
    return time.convertMinsToHrsMins(mins);
  }

  async deleteService(category: ServiceCategory, idx: number): Promise<void> {
    const [service] = category.services.splice(idx, 1);

    if (service.uuid !== undefined) {
      try {
        await this.stylistService.deleteStylistService(service.uuid);
      } catch (e) {
        showAlert('Error', e);

        // put service back if error occurred
        category.services.splice(idx, 0, service);
      }
    }

    this.isEmptyCategories = ServicesListComponent.checkIfEmptyCategories(this.categories);
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
    let categoryIndex = this.categories.findIndex(x => x.uuid === itemToEdit.categoryUuid);
    let category: ServiceCategory = this.categories[categoryIndex];
    let serviceIndex: number = itemToEdit.service ? category.services.findIndex(x => x === itemToEdit.service) : -1;

    if (itemToEdit.categoryUuid !== editedItem.categoryUuid) {
      // Remove from old category
      if (serviceIndex !== -1) {
        category.services.splice(serviceIndex, 1);
      }

      // Edit item not empty (indicates deletion if it is empty)
      if (editedItem.service) {
        // Not empty. Add to new category.
        categoryIndex = this.categories.findIndex(x => x.uuid === editedItem.categoryUuid);
        category = this.categories[categoryIndex];
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

    this.isEmptyCategories = ServicesListComponent.checkIfEmptyCategories(this.categories);
  }
}
