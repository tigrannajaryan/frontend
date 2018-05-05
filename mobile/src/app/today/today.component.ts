import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import {
  CheckinAction,
  LoadAction,
  selectTodayState,
  TempAddAction,
  TodayState
} from './today.reducer';

import { Today } from './today.models';

@IonicPage({ segment: 'today' })
@Component({
  selector: 'page-today',
  templateUrl: 'today.component.html'
})
export class TodayComponent {

  today: Today;

  private stateSubscription: Subscription;

  constructor(private store: Store<TodayState>) {
  }

  ionViewDidEnter(): void {
    // Subscribe to receive updates on todayState data.
    this.stateSubscription = this.store.select(selectTodayState)
      .subscribe(todayState => {
        // Received new state. Update the view.
        this.today = todayState.today;

        // TODO: process the rest of the state
      });

    // Initiate loading the today data.
    this.store.dispatch(new LoadAction());

    // TODO: Remove the following line. This is for demo purposes only.
    setTimeout(() => { this.pushNotificationDemo(); }, 2000);
  }

  ionViewDidLeave(): void {
    // Unsubscribe from observer when this view is no longer visible
    // to avoid unneccessary processing.
    this.stateSubscription.unsubscribe();
  }

  /**
   * Handler for checkin button.
   */
  checkin(appointmentUuid: string): void {
    this.store.dispatch(new CheckinAction(appointmentUuid));
  }

  /**
   * This is supposedly a push notification handler which
   * modifies the state. This function is here just for
   * demo purposes on how to work with the state. Must be
   * replaced by real push notification handler in the future.
   */
  private pushNotificationDemo(): void {
    this.store.dispatch(new TempAddAction());
  }
}
