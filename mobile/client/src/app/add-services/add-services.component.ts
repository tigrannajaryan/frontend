import { Component, ViewChild } from '@angular/core';
import { Content, NavParams } from 'ionic-angular';

import { ClientAppointmentModel } from '~/shared/api/appointments.models';
import { CheckOutService, ServiceFromAppointment } from '~/shared/api/stylist-app.models';

import { GetStylistServicesParams, ServiceCategoryModel } from '~/core/api/services.models';
import { ServicesService } from '~/core/api/services.service';
import { MadeDisableOnClick } from '~/shared/utils/loading';

export class AddServicesComponentParams {
  appointment: ClientAppointmentModel;
  selectedServices: CheckOutService[];
  onComplete: (addedServices: ServiceFromAppointment[]) => void;
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
  @ViewChild(Content) content: Content;

  hasServices: boolean;
  serviceCategories: ServiceCategoryModel[];

  private addedServices: ServiceFromAppointment[];
  private params: AddServicesComponentParams;

  constructor(
    private api: ServicesService,
    private navParams: NavParams
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    this.params = this.navParams.get('params') as AddServicesComponentParams;
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    const params: GetStylistServicesParams = {
      stylist_uuid: this.params.appointment.stylist_uuid
    };
    const { response } = await this.api.getStylistServices(params).toPromise();

    if (response) {
      this.serviceCategories = this.filterSelectedServices(response.categories);

      this.hasServices = response.categories.some(category => category.services.length > 0);

      this.content.resize();
    }
  }

  calcAddedServicesPrice(): number {
    return this.addedServices.reduce((price, service) => {
      return price + service.regular_price;
    }, 0);
  }

  protected onServiceAdd(services: ServiceFromAppointment[]): void {
    this.addedServices = services;
  }

  @MadeDisableOnClick
  protected async addServicesClick(): Promise<void> {
    // Call the callback. It is expected that the callback will close this page in a
    // way that mirrors how this page was opened (but this page doesn't really care how)
    this.params.onComplete(this.addedServices);
  }

  /**
   * Filter and return only selected services. Keep categories.
   */
  private filterSelectedServices(serviceCategories: ServiceCategoryModel[]): ServiceCategoryModel[] {
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
