import { Component, OnDestroy } from '@angular/core';
import { Events } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

import { ProfileDataStore } from '~/profile/profile.data';
import { ProfileCompleteness, ProfileModel } from '~/core/api/profile.models';
import { checkProfileCompleteness } from '~/core/utils/user-utils';

import { ClientEventTypes } from '~/core/client-event-types';
import { MainTabIndex } from '~/main-tabs/main-tabs.component';

@Component({
  selector: 'profile-header',
  templateUrl: 'profile-header.component.html'
})
export class ProfileHeaderComponent implements OnDestroy {
  profile: ProfileModel;
  profileCompleteness: ProfileCompleteness;
  private profileObservableSubscription: Subscription;

  constructor(
    private events: Events,
    private profileDataStore: ProfileDataStore
  ) {

    this.profileObservableSubscription = this.profileDataStore.asObservable().subscribe(user => {
      if (user.response) {
        this.profile = user.response;
        this.profileCompleteness = checkProfileCompleteness(user.response);
      }
    });
  }

  ngOnDestroy(): void {
    this.profileObservableSubscription.unsubscribe();
  }

  onClick(): void {
    this.events.publish(ClientEventTypes.selectMainTab, MainTabIndex.Profile);
  }
}
