import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser/src/security/dom_sanitization_service';

import { StylistServiceProvider } from '~/shared/stylist-api/stylist-service';
import { ServiceTemplateSetBase } from '~/shared/stylist-api/stylist-models';
import { loading } from '~/shared/utils/loading';
import { PageNames } from '~/core/page-names';

export enum ServiceListType {
  blank = 'blank'
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
  protected serviceTemplateSets: ServiceTemplateSetBase[];
  protected whiteImage: SafeStyle;
  protected blackImage: SafeStyle;
  isLoading = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private stylistService: StylistServiceProvider,
    private sanitizer: DomSanitizer
  ) {
    this.whiteImage = this.sanitizer.bypassSecurityTrustStyle('url(assets/imgs/services/white.png)');
    this.blackImage = this.sanitizer.bypassSecurityTrustStyle('url(assets/imgs/services/black.png)');
  }

  async ionViewWillLoad(): Promise<void> {
    const { response } = await loading(this, this.stylistService.getServiceTemplateSetsList());
    if (response) {
      this.serviceTemplateSets = response.service_template_sets;
    }
  }

  openService(serviceItem?: ServiceTemplateSetBase): void {
    const serviceItemUuid = serviceItem ? serviceItem.uuid : ServiceListType.blank;

    this.navCtrl.push(PageNames.ServicesList, { uuid: serviceItemUuid });
  }
}
