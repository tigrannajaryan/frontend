import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/shared/page-names';
import { StylistServiceProvider } from '~/shared/stylist-service/stylist-service';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfileComponent {

  constructor(
    private navCtrl: NavController,
    private stylistService: StylistServiceProvider
  ) {
  }

  async ionViewWillLoad() {
  }

  // TODO: Link component with to=PageNames.SomePageName
  to(page: PageNames, params: Object = {}): void {
    this.navCtrl.push(page, {isProfile: true, ...params}, {animate: false});
  }

  toRegisterServices(): void {
    this.to(PageNames.RegisterServicesItem, {uuid: ''});
  }

  toRegisterSalon(): void {
    this.to(PageNames.RegisterSalon);
  }

  toWorktime(): void {
    this.to(PageNames.Worktime);
  }

  toDiscounts(): void {
    this.to(PageNames.Discounts);
  }

}
