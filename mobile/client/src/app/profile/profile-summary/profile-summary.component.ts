import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { composeRequest, loading } from '~/core/utils/request-utils';

import { ProfileDataStore } from '~/profile/profile.data';
import { ProfileModel } from '~/core/api/profile.models';

@IonicPage()
@Component({
  selector: 'profile-summary',
  templateUrl: 'profile-summary.component.html'
})
export class ProfileSummaryComponent {
  profile: ProfileModel;

  isLoading = false;

  readonly DEFAULT_IMAGE = 'url(/assets/imgs/user/default_user.png)';

  constructor(
    private navCtrl: NavController,
    private profileDataStore: ProfileDataStore
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    const { response } = await composeRequest<ProfileModel>(
      loading(isLoading => this.isLoading = isLoading),
      this.profileDataStore.get()
    );
    if (response) {
      this.profile = response;
    }
  }

  isProfileCompleted(): boolean {
    return Boolean(this.profile && this.profile.first_name);
  }

  onEdit(): void {
    this.navCtrl.push(PageNames.ProfileEdit, { profile: this.profile });
  }
}
