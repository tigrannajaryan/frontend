import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ServicesTemplate } from '~/core/stylist-service/stylist-models';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { PageNames } from '~/core/page-names';

@IonicPage({
  segment: 'services'
})
@Component({
  selector: 'page-services',
  templateUrl: 'services.component.html'
})
export class ServicesComponent {
  serviceTemplates: ServicesTemplate[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private stylistService: StylistServiceProvider
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    this.serviceTemplates = (await this.stylistService.getServiceTemplateSets()).service_templates;
  }

  openService(serviceItem: ServicesTemplate): void {
    this.navCtrl.push(PageNames.RegisterServicesItem, { uuid: serviceItem.uuid });
  }
}
