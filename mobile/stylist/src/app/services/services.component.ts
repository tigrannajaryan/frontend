import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { loading } from '~/core/utils/loading';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { PageNames } from '~/core/page-names';
import { ServiceTemplateSetBase } from '~/core/stylist-service/stylist-models';

export enum ServiceListType {
  blank
}

@IonicPage({
  segment: 'services'
})
@Component({
  selector: 'page-services',
  templateUrl: 'services.component.html'
})
export class ServicesComponent {
  // to use in html
  protected PageNames = PageNames;
  serviceTemplateSets: ServiceTemplateSetBase[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private stylistService: StylistServiceProvider
  ) {
  }

  @loading
  async ionViewWillLoad(): Promise<void> {
    this.serviceTemplateSets = (await this.stylistService.getServiceTemplateSetsList()).service_template_sets;
  }

  openService(serviceItem?: ServiceTemplateSetBase): void {
    const serviceItemUuid = serviceItem ? serviceItem.uuid : ServiceListType.blank;

    this.navCtrl.push(PageNames.RegisterServicesItem, { uuid: serviceItemUuid });
  }
}
