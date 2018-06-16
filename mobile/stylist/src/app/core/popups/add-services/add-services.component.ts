import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { loading } from '~/core/utils/loading';
import { ServiceCategory, ServiceItem, StylistServicesList } from '~/core/stylist-service/stylist-models';
import { CheckOutService } from '~/today/today.models';

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
@IonicPage({ segment: 'appointment-checkout/:appointmentUuid/add-service' })
@Component({
  selector: 'page-add-service',
  templateUrl: 'add-services.component.html'
})
export class AddServicesComponent {
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
    const response = await this.stylistService.getStylistServices() as StylistServicesList;
    this.serviceCategories = this.filterSelectedServices(response.categories);
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
