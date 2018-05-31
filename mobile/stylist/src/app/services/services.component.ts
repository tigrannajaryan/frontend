import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { loading } from '~/core/utils/loading';
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
  // to use in html
  protected PageNames = PageNames;
  serviceTemplates: ServicesTemplate[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private stylistService: StylistServiceProvider
  ) {
  }

  @loading
  async ionViewWillLoad(): Promise<void> {
    this.serviceTemplates = (await this.stylistService.getServiceTemplateSets()).service_templates;
  }

  openService(serviceItem: ServicesTemplate): void {
    this.navCtrl.push(PageNames.RegisterServicesItem, { uuid: serviceItem.uuid });
  }
}
