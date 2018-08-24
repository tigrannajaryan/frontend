import { Component } from '@angular/core';
import { App } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { PageNames } from '~/core/page-names';
import { ProfileDataStore } from '~/profile/profile.data';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiResponse } from '~/core/api/base.models';

@Component({
  selector: 'profile-header',
  templateUrl: 'profile-header.component.html'
})
export class ProfileHeaderComponent {

  profileObservable: Observable<ApiResponse<ProfileModel>>;

  constructor(
    private app: App,
    private profileDataStore: ProfileDataStore
  ) {
    this.profileObservable = this.profileDataStore.asObservable();
    this.profileDataStore.get();
  }

  onClick(): void {
    this.app.getRootNav().push(PageNames.ProfileSummary);
  }
}
