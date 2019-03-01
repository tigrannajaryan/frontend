import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { PageNames } from '~/core/page-names';
import { StylistProfile, StylistProfileCompleteness } from '~/shared/api/stylist-app.models';
import { calcProfileCompleteness } from '~/core/utils/stylist-utils';
import { ProfileDataStore } from '~/core/profile.data';
import { loading } from '~/core/utils/loading';

@Component({
  selector: 'page-profile-incomplete',
  templateUrl: 'profile-incomplete.component.html'
})
export class ProfileIncompleteComponent {
  PageNames = PageNames;

  profile: StylistProfile;
  stylistProfileCompleteness: StylistProfileCompleteness;

  constructor(
    public navCtrl: NavController,
    public profileData: ProfileDataStore
  ) {
  }

  @loading
  async ionViewWillEnter(): Promise<void> {
    const { response } = await this.profileData.get({refresh: true});
    if (response) {
      this.profile = response;
    }

    if (this.profile) {
      this.stylistProfileCompleteness = calcProfileCompleteness(this.profile);
    }
  }
}
