import { Component } from '@angular/core';
import { AlertController, NavController, NavParams } from 'ionic-angular';

import { StylistServiceProvider } from '~/core/api/stylist.service';
import { ServiceCategory, ServiceItem, StylistServicesList } from '~/shared/api/stylist-app.models';
import { CheckOutService } from '~/core/api/home.models';
import { loading } from '~/core/utils/loading';
import { PageNames } from '~/core/page-names';
import { ServicesComponentParams } from '~/services/services.component';

export class AddServicesComponentParams {
  appointmentUuid: string;
  selectedServices: CheckOutService[];
  onComplete: (addedServices: ServiceItem[]) => void;
}

/**
 * This screen shows the list of services and allows adding and removing them.
 * The screen is used during appointment checkout process and allows
 * modifying the appointment.
 */
@Component({
  selector: 'page-add-service',
  templateUrl: 'add-services.component.html'
})
export class AddServicesComponent {
  hasServices: boolean;
  protected serviceCategories: ServiceCategory[];
  protected addedServices: ServiceItem[];
  protected params: AddServicesComponentParams;

  constructor(
    protected navCtrl: NavController,
    protected navParams: NavParams,
    protected alertCtrl: AlertController,
    protected stylistService: StylistServiceProvider
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    this.params = this.navParams.get('data') as AddServicesComponentParams;
    this.loadInitialData();
  }

  @loading
  async loadInitialData(): Promise<void> {
    const response: StylistServicesList = (await this.stylistService.getStylistServices().get()).response;
    if (response) {
      this.serviceCategories = this.filterSelectedServices(response.categories);

      this.hasServices = response.categories.some(category => category.services.length > 0);
    }
  }

  addMyServices(): void {
    const params: ServicesComponentParams = {
      isRootPage: false
    };

    this.navCtrl.push(PageNames.Services, { params });
  }

  protected onServiceAdd(services): void {
    this.addedServices = services;
  }

  protected addServicesClick(): void {
    // Call the callback. It is expected that the callback will close this page in a
    // way that mirrors how this page was opened (but this page doesn't really care how)
    this.params.onComplete(this.addedServices);
  }

  /**
   * Filter and return only selected services. Keep categories.
   */
  private filterSelectedServices(serviceCategories: ServiceCategory[]): ServiceCategory[] {
    const allServices = serviceCategories.reduce((all, category) => [...all, ...category.services], []);

    for (const checkoutService of this.params.selectedServices) {
      const service = allServices.find(serviceItem => serviceItem.uuid === checkoutService.service_uuid);
      if (service) {
        service.isChecked = true;
      }
    }

    return serviceCategories;
  }
}
