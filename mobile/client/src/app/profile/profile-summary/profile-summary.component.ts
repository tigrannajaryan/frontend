import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { cache, composeRequest, loading } from '~/core/utils/request-utils';

import { ProfileService } from '~/core/api/profile-service';
import { ProfileModel } from '~/core/api/profile.models';

@IonicPage()
@Component({
  selector: 'profile-summary',
  templateUrl: 'profile-summary.component.html'
})
export class ProfileSummaryComponent {
  profile: ProfileModel;

  isLoading = false;

  constructor(
    private navCtrl: NavController,
    private profileService: ProfileService
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    const { response } = await composeRequest(
      cache('profile'),
      loading(isLoading => this.isLoading = isLoading),
      this.profileService.getProfile()
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
