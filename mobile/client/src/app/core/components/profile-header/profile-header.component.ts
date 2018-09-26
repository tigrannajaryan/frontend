import { Component, OnDestroy } from '@angular/core';
import { Events } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ApiResponse } from '~/shared/api/base.models';
import { ProfileDataStore } from '~/profile/profile.data';
import { ProfileCompleteness, ProfileModel } from '~/core/api/profile.models';
import { checkProfileCompleteness } from '~/core/utils/user-utils';

import { EventTypes } from '~/core/event-types';
import { TabIndex } from '~/main-tabs/main-tabs.component';

@Component({
  selector: 'profile-header',
  templateUrl: 'profile-header.component.html'
})
export class ProfileHeaderComponent implements OnDestroy {
  profileObservable: Observable<ApiResponse<ProfileModel>>;
  profileCompleteness: ProfileCompleteness;
  private profileObservableSubscription: Subscription;

  constructor(
    private events: Events,
    private profileDataStore: ProfileDataStore
  ) {
    this.profileObservable = this.profileDataStore.asObservable();

    this.profileDataStore.get();

    this.profileObservableSubscription = this.profileObservable.subscribe(user => {
      if (user.response) {
        this.profileCompleteness = checkProfileCompleteness(user.response);
      }
    });
  }

  ngOnDestroy(): void {
    this.profileObservableSubscription.unsubscribe();
  }

  onClick(): void {
    this.events.publish(EventTypes.selectMainTab, TabIndex.Profile);
  }
}
