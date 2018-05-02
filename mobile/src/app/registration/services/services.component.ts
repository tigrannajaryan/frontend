import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import 'rxjs/operators/pluck';

import { StylistServiceProvider } from '../../../providers/stylist-service/stylist-service';
import { StoreService } from '../../../providers/store/store';
import { ServicesTemplate } from '../../../providers/stylist-service/stylist-models';
import { ServiceTemplatesResponse } from '../../../providers/store/store-model';
import { PageNames } from '../../../pages/page-names';
import { BaseComponent } from '../../../helpers/base-component';

@IonicPage({
  segment: 'services'
})
@Component({
  selector: 'page-services',
  templateUrl: 'services.component.html'
})
export class ServicesComponent extends BaseComponent {
  serviceTemplates: ServicesTemplate[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private store: StoreService,
    private stylistService: StylistServiceProvider
  ) {
    super();
    // call api
    this.stylistService.getServiceTemplateSets();
    // get fresh data
    this.store.changes.safeSubscribe(this, (res: ServiceTemplatesResponse) => {
      this.serviceTemplates = res.service_templates;
    });
  }

  openService(serviceItem: ServicesTemplate): void {
    this.navCtrl.push(PageNames.RegisterServicesItem, {uuid: serviceItem.uuid});
  }
}
