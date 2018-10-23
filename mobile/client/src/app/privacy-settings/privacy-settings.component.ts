import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { ProfileApi } from '~/core/api/profile-api';
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
    private alertCtrl: AlertController,
    private profileApi: ProfileApi
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
      const alert = this.alertCtrl.create({
        title: 'Are you sure you want to change your privacy settings?',
        subTitle: 'Changing your settings means you won\'t be able to view other MADE Clients.',
        buttons: [{
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Yes, Change',
          handler: () => {
            this.updateProfileSettings(privacy);
          }
        }]
      });
      alert.present();
    } else {
      this.updateProfileSettings(privacy);
    }
  }

  private async updateProfileSettings(privacy: PrivacyMode): Promise<void> {
    const { response } = await this.profileApi.updateProfile({ privacy }).get();
    this.profile = response;
    this.profileDataStore.set(response);
  }
}
