import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { componentUnloaded } from '~/shared/component-unloaded';

import { DayOffer } from '~/shared/api/price.models';
import { ServiceItem, StylistProfile } from '~/shared/stylist-api/stylist-models';
import { StylistServicesDataStore } from '~/services/services-list/services.data';
import { MyClientModel } from '~/shared/stylist-api/clients-api.models';
import { ClientsApi } from '~/shared/stylist-api/clients-api';

import { PageNames } from '~/core/page-names';
import { loading } from '~/core/utils/loading';
import { ProfileState, selectProfile } from '~/core/components/user-header/profile.reducer';

@Component({
  selector: 'page-clients-calendar',
  templateUrl: 'clients-calendar.component.html'
})
export class ClientsCalendarComponent {
  client?: MyClientModel;

  profile: Observable<StylistProfile>;
  prices: DayOffer[] = [];
  services: ServiceItem[] = [];

  constructor(
    private clientsApi: ClientsApi,
    private navCtrl: NavController,
    private navParams: NavParams,
    private servicesData: StylistServicesDataStore,
    private store: Store<ProfileState>
  ) {
  }

  ionViewWillLoad(): Promise<void> {
    this.client = this.navParams.get('client') as MyClientModel;
    this.profile = this.store.select(selectProfile);
    return this.getPricing();
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
    this.navCtrl.push(PageNames.AddServicesComponent, { data: {
      selectedServices: this.services.map(service => ({ service_uuid: service.uuid })),
      onComplete: services => {
        this.navCtrl.pop();
        this.getPricing(services.map(service => service.service_uuid));
      }
    }});
  }

  onDeleteService(service: ServiceItem): void {
    this.getPricing(
      this.services
        .filter(({ uuid }) => uuid !== service.uuid)
        .map(({ uuid }) => uuid)
    );
  }

  @loading
  private async getPricing(serviceUuids?: string[]): Promise<void> {
    await this.clientsApi.getPricing(this.client && this.client.uuid, serviceUuids)
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
  }
}
