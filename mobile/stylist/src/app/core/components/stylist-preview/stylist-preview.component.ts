import { Component, Input } from '@angular/core';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { NavController } from 'ionic-angular';

import { ExternalAppService } from '~/shared/utils/external-app-service';
import { StylistProfile } from '~/shared/api/stylist-app.models';
import { PageNames } from '~/core/page-names';

@Component({
  selector: 'stylist-preview',
  templateUrl: 'stylist-preview.component.html'
})
export class StylistPreviewComponent {
  @Input() stylist: StylistProfile;

  constructor(
    private externalAppService: ExternalAppService,
    private launchNavigator: LaunchNavigator,
    private navCtrl: NavController
  ) {
  }

  onAddressClick(): void {
    this.externalAppService.openAddress(this.launchNavigator, this.stylist.salon_address);
  }

  onInstagramClick(): void {
    this.externalAppService.openInstagram(this.stylist.instagram_url);
  }

  onWebsiteClick(): void {
    this.externalAppService.openWebPage(this.stylist.website_url);
  }

  onFollowersClick(): void {
    this.navCtrl.push(PageNames.MyClients);
  }

  onShowCalendar(): void {
    this.navCtrl.push(PageNames.ClientsCalendar);
  }
}
