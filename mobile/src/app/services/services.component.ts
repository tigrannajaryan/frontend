import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ServicesTemplate } from '../shared/stylist-service/stylist-models';
import { StylistServiceProvider } from '../shared/stylist-service/stylist-service';
import { PageNames } from '../shared/page-names';

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
    this.init();
  }

  async init(): Promise<void> {
    this.serviceTemplates = (await this.stylistService.getServiceTemplateSets()).service_templates;
  }

  openService(serviceItem: ServicesTemplate): void {
    this.navCtrl.push(PageNames.RegisterServicesItem, { uuid: serviceItem.uuid });
  }
}
