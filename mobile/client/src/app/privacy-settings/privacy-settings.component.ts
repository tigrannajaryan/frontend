import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { ProfileModel } from '~/core/api/profile.models';

import { componentUnloaded } from '~/shared/component-unloaded';
import { ApiResponse } from '~/shared/api/base.models';

import { ProfileDataStore } from '~/profile/profile.data';

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
    public profileDataStore: ProfileDataStore,
    private alertCtrl: AlertController
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.profileDataStore.asObservable()
      .takeUntil(componentUnloaded(this))
      .subscribe((apiRes: ApiResponse<ProfileModel>) => {
        const profile: ProfileModel = apiRes.response;
        if (profile) {
          this.profile = profile;
        }
      });
  }

  showWarningPopup(privacy: PrivacyMode): void {
    if (privacy === PrivacyMode.private) {
      if (this.profile.privacy === PrivacyMode.private) {
        return;
      }

      const alert = this.alertCtrl.create({
        title: 'Are you sure you want to change your privacy settings?',
        subTitle: 'Changing your settings means you won\'t be able to view other MADE Clients.',
        buttons: [{
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Yes, Change',
          handler: () => {
            this.profileDataStore.update({ privacy });
          }
        }]
      });
      alert.present();
    } else if (privacy === PrivacyMode.public) {
      if (this.profile.privacy === PrivacyMode.public) {
        return;
      }

      this.profileDataStore.update({ privacy });
    }
  }
}
