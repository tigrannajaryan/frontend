import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import 'rxjs/operators/pluck';

import { StylistServiceProvider } from '../../../providers/stylist-service/stylist-service';
import { ServicesTemplate } from '../../../providers/stylist-service/stylist-models';
import { PageNames } from '../../../pages/page-names';

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
