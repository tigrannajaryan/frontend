import { Component } from '@angular/core';
import { ActionSheetController, IonicPage } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import {
  LoadAction,
  selectTodayState,
  TodayState
} from './today.reducer';

import { Today } from './today.models';
import { TodayService } from '~/today/today.service';

export enum AppointmentStatuses {
  new = 'new',
  no_show = 'no_show',
  cancelled_by_stylist = 'cancelled_by_stylist',
  checked_out = 'checked_out'
}

@IonicPage({ segment: 'today' })
@Component({
  selector: 'page-today',
  templateUrl: 'today.component.html'
})
export class TodayComponent {

  today: Today;

  private stateSubscription: Subscription;

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public todayService: TodayService,
    private store: Store<TodayState>
  ) {
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
  }

  ionViewDidLeave(): void {
    // Unsubscribe from observer when this view is no longer visible
    // to avoid unneccessary processing.
    this.stateSubscription.unsubscribe();
  }

  openModal(appointmentUuid: string): void {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'NOT PAID',
      buttons: [
        {
          text: 'Checkout',
          handler: () => {
            this.checkOutAppointment(appointmentUuid);
          }
        },
        {
          text: 'Cancel',
          role: 'destructive',
          handler: () => {
            this.cancelAppointment(appointmentUuid);
          }
        }
      ]
    });
    actionSheet.present();
  }

  /**
   * Handler for checkout appointment button.
   */
  checkOutAppointment(appointmentUuid: string): void {
    this.todayService.setAppointment(appointmentUuid, { status: AppointmentStatuses.checked_out });
  }

  /**
   * Handler for cancel appointment button.
   */
  cancelAppointment(appointmentUuid: string): void {
    this.todayService.setAppointment(appointmentUuid, { status: AppointmentStatuses.cancelled_by_stylist });
  }
}
