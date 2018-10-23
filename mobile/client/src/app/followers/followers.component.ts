import { AlertController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';

import { componentUnloaded } from '~/shared/component-unloaded';
import { loading } from '~/shared/utils/request-utils';
import { ApiResponse } from '~/shared/api/base.models';

import { FollowersApi } from '~/core/api/followers.api';
import { FollowersModel } from '~/core/api/followers.models';
import { PageNames } from '~/core/page-names';
import { ProfileModel } from '~/core/api/profile.models';

import { ProfileDataStore } from '~/profile/profile.data';
import { PrivacyMode } from '~/privacy-settings/privacy-settings.component';

@Component({
  selector: 'followers',
  templateUrl: 'followers.component.html'
})
export class FollowersComponent {
  PrivacyMode = PrivacyMode;
  PageNames = PageNames;
  isLoading = false;

  profile: ProfileModel;
  followers: FollowersModel[];

  constructor(
    public profileDataStore: ProfileDataStore,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private followersApi: FollowersApi
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    const attachLoader = loading(isLoading => this.isLoading = isLoading);

    attachLoader(this.profileDataStore.asObservable())
      .takeUntil(componentUnloaded(this))
      .subscribe((apiRes: ApiResponse<ProfileModel>) => {
        const profile: ProfileModel = apiRes.response;
        if (profile) {
          this.profile = profile;
        }
      });



    const stylistUuid = this.navParams.get('stylistUuid');
    const { response } = await this.followersApi.getFollowers(stylistUuid).get();
    if (response) {
      this.followers = response.followers;
    }
  }

  showFollowersPopup(follower: FollowersModel): void {
    if (follower.booking_count > 2) {
      const alert = this.alertCtrl.create({
        title: '<i class="mb-icon-wash-and-style"></i>',
        subTitle: `This client has booked ${ follower.booking_count } or more<br/>times with this stylist`,
        cssClass: 'mb-popup-orange',
        buttons: [{
          text: 'Close',
          role: 'cancel'
        }]
      });
      alert.present();
    }
  }
}
