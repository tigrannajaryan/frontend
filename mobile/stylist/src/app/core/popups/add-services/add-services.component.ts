import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { loading } from '~/core/utils/loading';
import { ServiceCategory, ServiceItem, StylistServicesList } from '~/core/stylist-service/stylist-models';
import { PageNames } from '~/core/page-names';
import { AppointmentCheckoutParams } from '~/appointment/appointment-checkout/appointment-checkout.component';

@IonicPage({ segment: 'appointment-checkout/:appointmentUuid/add-service' })
@Component({
  selector: 'page-add-service',
  templateUrl: 'add-services.component.html'
})
export class AddServicesComponent {
  protected serviceCategories: ServiceCategory[];
  protected addedServices: ServiceItem[];
  protected params: AppointmentCheckoutParams;

  constructor(
    protected navCtrl: NavController,
    protected navParams: NavParams,
    protected alertCtrl: AlertController,
    protected stylistService: StylistServiceProvider
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    this.params = this.navParams.data as AppointmentCheckoutParams;
    this.loadInitialData();
  }

  @loading
  async loadInitialData(): Promise<void> {
    const response = await this.stylistService.getStylistServices() as StylistServicesList;
    this.serviceCategories = this.checkIfChecked(response.categories);
  }

  protected onServiceAdd(services): void {
    this.addedServices = services;
  }

  protected addServices(): void {
    this.navCtrl.push(PageNames.AppointmentCheckout, {
      appointmentUuid: this.params.appointmentUuid,
      services: this.addedServices
    });
  }

  private checkIfChecked(serviceCategories: ServiceCategory[]): ServiceCategory[] {
    const allServices = serviceCategories.reduce((all, category) => [...all, ...category.services], []);

    for (const checkoutService of this.params.services) {
      const service = allServices.find(serviceItem => serviceItem.uuid === checkoutService.service_uuid);
      if (service) {
        service.isChecked = true;
      }
    }

    return serviceCategories;
  }
}
