import { Component } from '@angular/core';
import {
  AlertController,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';

import { loading } from '~/shared/utils/loading';
import { ServiceTemplateSetResponse, StylistServiceProvider } from '~/core/api/stylist.service';
import { ServiceCategory, ServiceTemplateItem, StylistProfileStatus, StylistServicesListResponse } from '~/shared/api/stylist-app.models';
import { getProfileStatus, updateProfileStatus } from '~/shared/storage/token-utils';
import { StylistServicesDataStore } from '~/services/services-list/services.data';

import { PageNames } from '~/core/page-names';
import { ServiceListType } from '~/services/services.component';
import { ServiceItemComponentData } from '~/services/services-item/services-item.component';

export interface ServicesListComponentParams {
  isRootPage?: boolean;
  uuid?: string;
}

@Component({
  selector: 'page-services-list',
  templateUrl: 'services-list.component.html'
})
export class ServicesListComponent {
  protected PageNames = PageNames;
  protected categories: ServiceCategory[] = [];
  protected isEmptyCategories = false;
  params: ServicesListComponentParams;
  protected timeGap = 30;
  isLoading = false;

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
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private servicesData: StylistServicesDataStore,
    private stylistService: StylistServiceProvider
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    this.params = this.navParams.get('params') as ServicesListComponentParams;
    let response: StylistServicesListResponse | ServiceTemplateSetResponse;

    if (this.params && this.params.uuid && this.params.uuid !== ServiceListType.blank) {
      response = (await loading(this, this.stylistService.getServiceTemplateSetByUuid(this.params.uuid))).response;
    } else if (this.params && this.params.uuid === ServiceListType.blank) {
      response = (await loading(this, this.servicesData.get())).response;
      response.categories = ServicesListComponent.buildBlankCategoriesList(response.categories);
    } else {
      response = (await loading(this, this.servicesData.get())).response;
    }
    this.categories = response.categories;
    this.timeGap = response.service_time_gap_minutes;
    this.isEmptyCategories = ServicesListComponent.checkIfEmptyCategories(this.categories);
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
      category: category || undefined
    };

    const profileModal = this.modalCtrl.create(PageNames.ServicesItem,
      {
        data: itemToEdit
      });
    profileModal.onDidDismiss(editedItem => {
      this.updateServiceItem(itemToEdit, editedItem);
    });
    profileModal.present();
  }

  async onContinue(): Promise<void> {
    const categoriesServices = this.stylistService.getFlatServiceList(this.categories);

    if (categoriesServices) {
      const { response } = await this.stylistService.setStylistServices({
        services: categoriesServices,
        service_time_gap_minutes: this.timeGap
      }).get();

      // Clear local cache since we modified the data directly via API
      // TODO: move all modifications to StylistServicesDataStore
      await this.servicesData.deleteCache();

      if (response) {
        const profileStatus = await getProfileStatus() as StylistProfileStatus;
        await updateProfileStatus({
          ...profileStatus,
          has_services_set: true
        });

        // If no services exists we landed to Services page to enter stylist’s services first.
        // When this happens ServicesList becomes a second page in stack. After services
        // are saved ServicesList should become a root page.
        const params: ServicesListComponentParams = { isRootPage: true };
        this.navCtrl.setRoot(PageNames.ServicesList, { params });
      }
    }
  }

  deleteConfirm(category: ServiceCategory, idx: number): void {
    const confirm = this.alertCtrl.create({
      message: 'Are you sure you want to delete this service?',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Ok',
          handler: () => {
            this.deleteService(category, idx);
          }
        }
      ]
    });
    confirm.present();
  }

  async deleteService(category: ServiceCategory, idx: number): Promise<void> {
    const [service] = category.services.splice(idx, 1);

    if (service.uuid !== undefined) {
      const { error } = await this.stylistService.deleteStylistService(service.uuid).get();
      if (error) {
        // put service back if error occurred
        category.services.splice(idx, 0, service);
      }
      // Clear local cache since we modified the data directly via API
      // TODO: move all modifications to StylistServicesDataStore
      await this.servicesData.deleteCache();
    }

    this.isEmptyCategories = ServicesListComponent.checkIfEmptyCategories(this.categories);
  }

  async saveRequest(): Promise<void> {
    const categoriesServices = this.stylistService.getFlatServiceList(this.categories);

    if (categoriesServices) {
      const { response } = await this.stylistService.setStylistServices({
        services: categoriesServices,
        service_time_gap_minutes: this.timeGap
      }).get();

      if (response) {
        // Set local cache since we modified the data directly via API
        // TODO: move all modifications to StylistServicesDataStore
        await this.servicesData.set(response);
        this.categories = response.categories;
      } else {
        // Clear local cache since we modified the data directly via API
        // TODO: move all modifications to StylistServicesDataStore
        await this.servicesData.deleteCache();
      }
    }
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

    if (!itemToEdit.category) {
      // This is new category in blank list
      itemToEdit.category = editedItem.category;
    }

    // Find old item
    let categoryIndex = this.categories.findIndex(x => x.uuid === itemToEdit.category.uuid);
    let category: ServiceCategory = this.categories[categoryIndex];
    let serviceIndex: number = itemToEdit.service ? category.services.findIndex(x => x === itemToEdit.service) : -1;

    if (editedItem.category && itemToEdit.category.uuid !== editedItem.category.uuid) {
      // Remove from old category
      if (serviceIndex !== -1) {
        category.services.splice(serviceIndex, 1);
      }

      // Edit item not empty (indicates deletion if it is empty)
      if (editedItem.service) {
        // Not empty. Add to new category.
        categoryIndex = this.categories.findIndex(x => x.uuid === editedItem.category.uuid);
        category = this.categories[categoryIndex];
        category.services.push(editedItem.service);
      }
    } else if (!editedItem.category) {
      // Item removed from new category in blank list
      category.services.splice(serviceIndex, 1);
    } else {
      // Update the service item
      if (serviceIndex === -1) {
        // this is a new item, append at the end
        serviceIndex = category.services.length;
      }
      category.services[serviceIndex] = editedItem.service;
    }

    this.isEmptyCategories = ServicesListComponent.checkIfEmptyCategories(this.categories);

    this.saveRequest();
  }
}
