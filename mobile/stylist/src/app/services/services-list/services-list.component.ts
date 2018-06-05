import { Component } from '@angular/core';
import {
  AlertController,
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

// this is required for saving uuid (page refresh will not remove it)
@IonicPage({ segment: 'services/:uuid' })
@Component({
  selector: 'page-services-list',
  templateUrl: 'services-list.component.html'
})
export class ServicesListComponent {
  protected PageNames = PageNames;
  protected isEmptyCategories = false;
  protected isProfile?: Boolean;
  protected timeGap = 15;
  protected templateSet: ServiceTemplateSet;

  static checkIfEmptyCategories(categories: ServiceCategory[]): boolean {
    return categories.every((cat: ServiceCategory) => {
      return cat.services.length === 0;
    });
  }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
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

      if (uuid) {
        response = await this.stylistService.getServiceTemplateSetById(uuid);
        this.templateSet = {
          ...response.template_set,
          categories: response.template_set.categories.map(this.removeServicesIds)
        };
      } else {
        response = await this.stylistService.getStylistServices();
        this.templateSet = {
          name: 'My services',
          description: '',
          categories: this.getCategorisedServices(response.services)
        };
      }

      this.isEmptyCategories = ServicesListComponent.checkIfEmptyCategories(this.templateSet.categories);
    } catch (e) {
      showAlert(this.alertCtrl, 'Loading services failed', e.message);
    }
  }

  removeServicesIds(category): ServiceCategory[] {
    return {
      ...category,
      services: category.services.map(({id, ...serviceWithoutId}) => serviceWithoutId)
    };
  }

  getCategorisedServices(services): ServiceCategory[] {
    return services.reduce((categories, service) => {
      let category = categories.find(({uuid}) => uuid === service.category_uuid);
      if (!category) {
        const {category_name: name, category_uuid: uuid} = service;
        category = {name, uuid, services: []};
        categories.push(category);
      }
      category.services.push(service);
      return categories;
    }, []);
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

  @loading
  async saveChanges(): Promise<void> {
    const categoriesServices =
      this.templateSet.categories.reduce((services, category) => (
        services.concat(
          category.services.map(service => ({
            ...service,
            is_enabled: true,
            category_uuid: category.uuid
          }))
        )
      ), []);

    try {
      await this.stylistService.setStylistServices(categoriesServices);
      if (this.isProfile) {
        this.navCtrl.pop();
      } else {
        this.navCtrl.push(PageNames.Worktime);
      }
    } catch (e) {
      // Show an error message
      showAlert(this.alertCtrl, 'Error', e);
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

    if (service.id !== undefined) {
      try {
        await this.stylistService.deleteStylistService(service.id);
      } catch (e) {
        showAlert(this.alertCtrl, 'Error', e);

        // put service back if error occurred
        category.services.splice(idx, 0, service);
      }
    }

    this.isEmptyCategories = ServicesListComponent.checkIfEmptyCategories(this.templateSet.categories);
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
    let serviceIndex: number = itemToEdit.service ? category.services.findIndex(x => x === itemToEdit.service) : -1;

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

    this.isEmptyCategories = ServicesListComponent.checkIfEmptyCategories(this.templateSet.categories);
  }
}
