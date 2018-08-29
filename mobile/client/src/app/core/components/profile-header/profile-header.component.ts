import { Component } from '@angular/core';
import { Events } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { ProfileDataStore } from '~/profile/profile.data';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiResponse } from '~/core/api/base.models';

import { EventTypes } from '~/core/event-types';

@Component({
  selector: 'profile-header',
  templateUrl: 'profile-header.component.html'
})
export class ProfileHeaderComponent {

  profileObservable: Observable<ApiResponse<ProfileModel>>;

  constructor(
    private events: Events,
    private profileDataStore: ProfileDataStore
  ) {
    this.profileObservable = this.profileDataStore.asObservable();
    this.profileDataStore.get();
  }

  onClick(): void {
    this.events.publish(EventTypes.profileSelected);
  }
}
