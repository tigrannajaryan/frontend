import { Component } from '@angular/core';
import { Events, NavController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

import { ApiResponse } from '~/shared/api/base.models';
import { ClientEventTypes } from '~/core/client-event-types';
import { MainTabIndex } from '~/main-tabs/main-tabs.component';
import { ProfileDataStore } from '~/profile/profile.data';
import { CalendarPrimingParams } from '~/shared/components/calendar-priming/calendar-priming.component';
import { PageNames } from '~/core/page-names';
import { ProfileModel } from '~/core/api/profile.models';
import { BookingData } from '~/core/api/booking.data';

@Component({
  selector: 'page-booking-complete',
  templateUrl: 'booking-complete.component.html'
})
export class BookingCompleteComponent {
  protected subscription: Subscription;
  protected calendarIntegrated = false;

  constructor(
    public bookingData: BookingData,
    private events: Events,
    private navCtrl: NavController,
    private profileDataStore: ProfileDataStore
  ) {
  }

  ionViewWillEnter(): void {
    // Subscribe to profile to know if Google Calendar is not integrated and to show the "Add to Calendar" action.
    this.subscription = this.profileDataStore.asObservable()
      .subscribe((response: ApiResponse<ProfileModel>) => {
        this.calendarIntegrated = (response && response.response && response.response.google_calendar_integrated);
    });
    this.profileDataStore.get();
  }

  ionViewWillLeave(): void {
    this.subscription.unsubscribe();
  }

  onReturnHomeClick(): void {
    this.navCtrl.popToRoot();
    this.events.publish(ClientEventTypes.selectMainTab, MainTabIndex.Home);
  }

  async onAddToCalendarClick(): Promise<void> {
    const params: CalendarPrimingParams = {
      // refresh profile status on success, so that we don't show "Add to Calendar" action anymore.
      onSuccess: () => this.profileDataStore.refresh()
    };
    this.navCtrl.push(PageNames.CalendarPriming, { params });
  }
}
