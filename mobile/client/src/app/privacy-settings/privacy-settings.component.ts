import { Component } from '@angular/core';
import { AlertController, NavParams } from 'ionic-angular';

import { ProfileApi } from '~/core/api/profile-api';
import { ProfileModel } from '~/core/api/profile.models';

export enum PrivacyMode {
  public = 'public',
  private = 'private'
}

@Component({
  selector: 'privacy-settings',
  templateUrl: 'privacy-settings.component.html'
})
export class PrivacySettingsComponent {
  PrivacyMode = PrivacyMode;

  profile: ProfileModel;

  constructor(
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private profileApi: ProfileApi
  ) {
  }

  ionViewCanEnter(): boolean {
    return Boolean(this.navParams.get('profile'));
  }

  ionViewWillLoad(): void {
    this.profile = this.navParams.get('profile');
  }

  showWarningPopup(privacy: PrivacyMode): void {
    const alert = this.alertCtrl.create({
      title: 'Are you sure you want to change your privacy-settings settings?',
      subTitle: 'Changing your settings means you won\'t be able to view other MADE Clients.',
      buttons: [{
        text: 'Cancel',
        role: 'cancel'
      }, {
        text: 'Yes, Change',
        handler: () => {
          setTimeout(async () => {
            const { response } = await this.profileApi.updateProfile({ privacy }).get();
            this.profile = response;
          });
        }
      }]
    });
    alert.present();
  }
}
