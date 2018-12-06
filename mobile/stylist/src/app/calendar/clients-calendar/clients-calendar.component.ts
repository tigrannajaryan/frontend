import { Component, ViewChild } from '@angular/core';
import { Content, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import { componentUnloaded } from '~/shared/component-unloaded';

import { DayOffer } from '~/shared/api/price.models';
import { ServiceItem, StylistProfile } from '~/shared/api/stylist-app.models';
import { StylistServicesDataStore } from '~/services/services-list/services.data';
import { MyClientModel } from '~/core/api/clients-api.models';
import { ClientsApi } from '~/core/api/clients-api';

import { PageNames } from '~/core/page-names';
import { loading } from '~/core/utils/loading';
import { ProfileDataStore } from '~/core/profile.data';
import { isoDateFormat } from '~/shared/api/base.models';

export interface ClientsCalendarComponentParams {
  isRootPage?: boolean;
  client?: MyClientModel;
}

@Component({
  selector: 'page-clients-calendar',
  templateUrl: 'clients-calendar.component.html'
})
export class ClientsCalendarComponent {
  @ViewChild(Content) content: Content;
  params: ClientsCalendarComponentParams;
  isLoaded = false;

  profile: StylistProfile;
  prices: DayOffer[] = [];
  services: ServiceItem[] = [];

  constructor(
    public profileData: ProfileDataStore,
    private clientsApi: ClientsApi,
    private navCtrl: NavController,
    private navParams: NavParams,
    private servicesData: StylistServicesDataStore
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    this.params = this.navParams.get('params') as ClientsCalendarComponentParams;

    const { response } = await this.profileData.get();
    if (response) {
      this.profile = response;
    }

    try {
      await this.getPricing();
    } finally {
      this.isLoaded = true;
    }
  }

  /**
   * Return the possessive form of the stylist first name, e.g. Richard’s, Amadeus’s.
   */
  getNamePossessiveForm(client: MyClientModel): string {
    const name = client && client.first_name;
    return name ? `${name}’s ` : '';
  }

  getRegularPrice(services: ServiceItem[]): number {
    return services.reduce((price, service) => price + service.base_price, 0);
  }

  onAddService(): void {
    this.navCtrl.push(PageNames.AddServicesComponent, {
      data: {
        selectedServices: this.services.map(service => ({ service_uuid: service.uuid })),
        onComplete: services => {
          this.navCtrl.pop();
          this.getPricing(services.map(service => service.service_uuid));
        }
      }
    });
  }

  async onDeleteService(service: ServiceItem): Promise<void> {
    this.getPricing(
      this.services
        .filter(({ uuid }) => uuid !== service.uuid)
        .map(({ uuid }) => uuid)
    );

    // Tell the content to recalculate its dimensions. According to Ionic docs this
    // should be called after dynamically adding/removing headers, footers, or tabs.
    // See https://ionicframework.com/docs/api/components/content/Content/#resize
    if (this.content) {
      this.content.resize();
    }
  }

  @loading
  private async getPricing(serviceUuids?: string[]): Promise<void> {
    if (serviceUuids && serviceUuids.length === 0) {
      // No services selected. Don't show prices
      this.prices = [{
        date: moment().format(isoDateFormat),
        price: undefined,
        is_fully_booked: false,
        is_working_day: false
      }];
      this.services = [];
      return;
    }

    await this.clientsApi.getPricing(this.params && this.params.client && this.params.client.uuid, serviceUuids)
      .combineLatest(Observable.from(this.servicesData.get()))
      .takeUntil(componentUnloaded(this))
      .map(([pricing, services]) => {
        if (pricing.response) {
          this.prices = pricing.response.prices;

          if (services.response) {
            this.services =
              services.response.categories
                .reduce((allServices, category) => [...allServices, ...category.services], [])
                .filter(service => pricing.response.service_uuids.indexOf(service.uuid) !== -1);
          }
        }
      })
      .toPromise();

    // Tell the content to recalculate its dimensions. According to Ionic docs this
    // should be called after dynamically adding/removing headers, footers, or tabs.
    // See https://ionicframework.com/docs/api/components/content/Content/#resize
    if (this.content) {
      this.content.resize();
    }
  }
}
