import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { StylistProfile, StylistProfileStatus } from '~/shared/api/stylist-app.models';
import { getProfileStatus } from '~/shared/storage/token-utils';

import { ProfileDataStore } from '~/core/profile.data';
import { calcProfileCompleteness } from '~/core/utils/stylist-utils';

@Component({
  selector: '[madeMenuHeader]',
  templateUrl: 'made-menu-header.component.html'
})
export class MadeMenuHeaderComponent implements OnDestroy, OnInit {
  @Input() hideBackButton;
  @Input() hideBackAndMenuButtons;

  profile: StylistProfile;
  private subscription: Subscription;

  private profileStatus: StylistProfileStatus;

  constructor(
    private profileData: ProfileDataStore
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.subscription = this.profileData.asObservable().subscribe(
      ({ response: profile }) => {
        this.profile = profile;
      }
    );
    this.profileStatus = await getProfileStatus() as StylistProfileStatus;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isNoticeShown(): boolean {
    if (!this.profile || !this.profileStatus) {
      return false;
    }
    const allCompleted =
      [
        'has_weekday_discounts_set',
        'has_deal_of_week_set',
        'has_invited_clients',
        'has_services_set',
        'has_business_hours_set'
      ].every(key => this.profileStatus[key]) &&
      calcProfileCompleteness(this.profile).isProfileComplete;

    return !allCompleted;
  }
}
