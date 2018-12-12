import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser/src/security/dom_sanitization_service';

import { StylistServiceProvider } from '~/core/api/stylist.service';
import { ServiceTemplateSetBase } from '~/shared/api/stylist-app.models';
import { loading } from '~/shared/utils/loading';
import { PageNames } from '~/core/page-names';

import { StylistServicesDataStore } from '~/services/services-list/services.data';
import { ServicesListComponentParams } from '~/services/services-list/services-list.component';

export enum ServiceListType {
  blank = 'blank'
}

@Component({
  selector: 'page-services',
  templateUrl: 'services.component.html'
})
export class ServicesComponent {
  // to use in html
  protected PageNames = PageNames;
  protected serviceTemplateSets: ServiceTemplateSetBase[];
  protected whiteImage: SafeStyle;
  protected blackImage: SafeStyle;
  isLoading = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private servicesData: StylistServicesDataStore,
    private stylistService: StylistServiceProvider,
    private sanitizer: DomSanitizer
  ) {
    this.whiteImage = this.sanitizer.bypassSecurityTrustStyle('url(assets/imgs/services/white.png)');
    this.blackImage = this.sanitizer.bypassSecurityTrustStyle('url(assets/imgs/services/black.png)');
  }

  async ionViewCanEnter(): Promise<boolean> {
    const { response } = await this.servicesData.get();
    if (response && response.categories.some(({ services }) => services.length !== 0)) {
      const params: ServicesListComponentParams = { isRootPage: true };
      this.navCtrl.setRoot(PageNames.ServicesList, { params });
    }

    return true;
  }

  async ionViewWillLoad(): Promise<void> {
    const { response } = await loading(this, this.stylistService.getServiceTemplateSetsList());
    if (response) {
      this.serviceTemplateSets = response.service_template_sets;
    }
  }

  openService(serviceItem?: ServiceTemplateSetBase): void {
    const params = {
      uuid: serviceItem ? serviceItem.uuid : ServiceListType.blank
    };

    this.navCtrl.push(PageNames.ServicesList, { params });
  }
}
