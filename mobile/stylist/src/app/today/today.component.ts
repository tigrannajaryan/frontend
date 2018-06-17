import { Component } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  IonicPage,
  NavController, NavParams
} from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import {
  LoadAction,
  selectTodayState,
  TodayState
} from './today.reducer';

import { AppointmentStatuses, Today } from './today.models';
import { Appointment } from '~/today/today.models';
import { TodayService } from '~/today/today.service';
import { PageNames } from '~/core/page-names';
import { AppointmentCheckoutParams } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { loading } from '~/core/utils/loading';

@IonicPage({ segment: 'today' })
@Component({
  selector: 'page-today',
  templateUrl: 'today.component.html'
})
export class TodayComponent {
  // this should be here if we using enum in html
  protected AppointmentStatuses = AppointmentStatuses;
  today: Today;

  private stateSubscription: Subscription;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public todayService: TodayService,
    public alertCtrl: AlertController,
    private store: Store<TodayState>,
    private actionSheetCtrl: ActionSheetController
  ) {
  }

  async ionViewDidEnter(): Promise<void> {
    // Subscribe to receive updates on todayState data.
    this.stateSubscription = await this.store.select(selectTodayState)
      .subscribe(todayState => {
        // Received new state. Update the view.
        this.today = todayState.today;
      });

    // Initiate loading the today data.
    this.store.dispatch(new LoadAction());
  }

  ionViewDidLeave(): void {
    // Unsubscribe from observer when this view is no longer visible
    // to avoid unneccessary processing.
    this.stateSubscription.unsubscribe();
  }

  /***
   * Update today page data
   */
  protected refresh(): void {
    this.store.dispatch(new LoadAction());
  }

  protected onAppointmentClick(appointment: Appointment): void {
    const buttons = [
      {
        text: 'Checkout Client',
        handler: () => {
          this.checkOutAppointmentClick(appointment);
        }
      }, {
        text: 'Delete Appointment',
        role: 'destructive',
        handler: () => {
          this.cancelAppointment(appointment);
        }
      }, {
        text: 'Back',
        role: 'cancel'
      }
    ];

    const actionSheet = this.actionSheetCtrl.create({ buttons });
    actionSheet.present();
  }

  /**
   * Handler for 'Checkout Client' action.
   */
  protected checkOutAppointmentClick(appointment: Appointment): void {
    const data: AppointmentCheckoutParams = { appointmentUuid: appointment.uuid };
    this.navCtrl.push(PageNames.AppointmentCheckout, { data });
  }

  /**
   * Handler for 'Cancel' action.
   */
  @loading
  protected async cancelAppointment(appointment: Appointment): Promise<void> {
    await this.todayService.changeAppointment(appointment.uuid, { status: AppointmentStatuses.cancelled_by_stylist });
    this.refresh();
  }
}
