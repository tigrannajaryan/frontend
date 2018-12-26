import { AlertController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';

import { componentUnloaded } from '~/shared/component-unloaded';
import { ApiResponse } from '~/shared/api/base.models';

import { FollowersApi } from '~/core/api/followers.api';
import { FollowersModel } from '~/core/api/followers.models';
import { PageNames } from '~/core/page-names';
import { ProfileModel } from '~/core/api/profile.models';

import { ProfileDataStore } from '~/profile/profile.data';
import { PrivacyMode } from '~/privacy-settings/privacy-settings.component';
import { StylistModel } from '~/shared/api/stylists.models';
import { loading } from '~/shared/utils/loading';

@Component({
  selector: 'followers',
  templateUrl: 'followers.component.html'
})
export class FollowersComponent {
  PrivacyMode = PrivacyMode;
  PageNames = PageNames;

  isLoading: boolean;
  stylist: StylistModel;
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
    this.profileDataStore.get();

    const profileResponse = await loading(this, this.profileDataStore.get());
    if (profileResponse.response) {
      this.profile = profileResponse.response;
    }

    this.stylist = this.navParams.get('stylist');
    const followersResponse = await loading(this, this.followersApi.getFollowers(this.stylist.uuid).get());
    if (followersResponse.response) {
      this.followers = followersResponse.response.followers;
    }
  }

  showFollowersPopup(follower: FollowersModel): void {
    if (follower.booking_count > 2) {
      const alert = this.alertCtrl.create({
        title: '<i class="mb-icon-conditioners-a"></i>',
        subTitle: 'This client has booked 3 or more<br/>times with this stylist',
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
