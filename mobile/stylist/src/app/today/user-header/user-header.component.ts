import { Component, Input, OnInit } from '@angular/core';
import { AlertController, NavController, PopoverController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { StylistProfile } from '~/core/stylist-service/stylist-models';

import { TodayComponent } from '~/today/today.component';
import { UserHeaderMenuComponent } from '~/today/user-header/user-header-menu/user-header-menu.component';
import { showAlert } from '~/core/utils/alert';

@Component({
  selector: '[madeUserHeader]',
  templateUrl: 'user-header.component.html'
})
export class UserHeaderComponent implements OnInit {
  @Input() hasBackButton: boolean;
  @Input() hasShadow: boolean;

  protected profile: StylistProfile;
  protected PageNames = PageNames;
  protected today = new Date();

  constructor(
    public popoverCtrl: PopoverController,
    protected navCtrl: NavController,
    private alertCtrl: AlertController,
    private apiService: StylistServiceProvider
  ) {
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  goToHome(): void {
    const previous = this.navCtrl.getPrevious();
    if (previous && previous.component === TodayComponent) {
      // When click on house icon navigate back if previous route is Today
      this.navCtrl.pop();
    } else {
      this.navCtrl.push(PageNames.Today);
    }
  }

  async loadUserData(): Promise<void> {
    try {
      this.profile = await this.apiService.getProfile();
      this.profile.profile_photo_url = `url(${this.profile.profile_photo_url})`;
    } catch (e) {
      showAlert(this.alertCtrl, 'Loading profile failed', e.message);
    }
  }

  protected openPopover(myEvent: Event): void {
    const popover = this.popoverCtrl.create(UserHeaderMenuComponent);
    popover.present({
      ev: myEvent
    });
  }
}
