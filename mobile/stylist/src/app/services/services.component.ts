import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser/src/security/dom_sanitization_service';

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
  protected serviceTemplateSets: ServiceTemplateSetBase[];
  protected whiteImage: SafeStyle;
  protected blackImage: SafeStyle;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private stylistService: StylistServiceProvider,
    private sanitizer: DomSanitizer
  ) {
    this.whiteImage = this.sanitizer.bypassSecurityTrustStyle('url(assets/imgs/services/white.png)');
    this.blackImage = this.sanitizer.bypassSecurityTrustStyle('url(assets/imgs/services/black.png)');
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
