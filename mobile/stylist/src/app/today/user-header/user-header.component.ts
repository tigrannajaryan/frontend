import { Component, Input } from '@angular/core';
import { AlertController, MenuController, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { StylistProfile } from '~/core/stylist-service/stylist-models';

@Component({
  selector: 'user-header',
  templateUrl: 'user-header.component.html'
})
export class UserHeaderComponent {
  @Input() hasBackButton: boolean;
  protected profile: StylistProfile;
  protected PageNames = PageNames;
  protected today = new Date();

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private apiService: StylistServiceProvider,
    private menuCtrl: MenuController
  ) {
    this.loadUserData();
  }

  goToHome(): void {
    this.navCtrl.push(PageNames.Today);
  }

  async loadUserData(): Promise<void> {
    try {
      this.profile = await this.apiService.getProfile();
      this.profile.profile_photo_url = `url(${this.profile.profile_photo_url})`;
    } catch (e) {
      const alert = this.alertCtrl.create({
        title: 'Loading profile failed',
        subTitle: e.message,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }

  protected openMenu(): void {
    this.menuCtrl.open();
  }
}
