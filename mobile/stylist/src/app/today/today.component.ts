import { Component } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  IonicPage,
  LoadingController,
  NavController, NavParams
} from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Loading } from 'ionic-angular/components/loading/loading';

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
    private loadingCtrl: LoadingController,
    private store: Store<TodayState>,
    private actionSheetCtrl: ActionSheetController
  ) {
  }

  async ionViewDidEnter(): Promise<void> {
    await this.checkedOutProcess(this.navParams.get('appointmentUuid'));

    this.updateTodayPage();
  }

  ionViewDidLeave(): void {
    // Unsubscribe from observer when this view is no longer visible
    // to avoid unneccessary processing.
    this.stateSubscription.unsubscribe();
  }

  /***
   * Update today page data
   * @param {boolean} hasLoader if true loader will start in this function
   * @param {() => void} callBack run in the end of function
   * @returns {Promise<void>}
   */
  async updateTodayPage(hasLoader = true, callBack?: () => void): Promise<void> {
    let loader: Loading;
    if (hasLoader) {
      loader = this.loadingCtrl.create();
      loader.present();
    }

    // Subscribe to receive updates on todayState data.
    this.stateSubscription = await this.store.select(selectTodayState)
      .subscribe(todayState => {
        // Received new state. Update the view.
        this.today = todayState.today;

        // TODO: process the rest of the state
      });

    // Initiate loading the today data.
    this.store.dispatch(new LoadAction());

    if (hasLoader) {
      loader.dismiss();
    }

    if (callBack) {
      callBack();
    }
  }

  onAppointmentClick(appointment: Appointment): void {
    const buttons = [
      {
        text: 'Checkout Client',
        handler: () => {
          this.checkOutAppointment(appointment);
        }
      }, {
        text: 'Delete Appointment',
        role: 'destructive',
        handler: () => {
          this.cancelAppointment(appointment);
        }
      }, {
        text: 'Cancel',
        role: 'cancel'
      }
    ];

    const actionSheet = this.actionSheetCtrl.create({ buttons });
    actionSheet.present();
  }

  /**
   * Handler for appointment-checkout appointment event.
   */
  async checkOutAppointment(appointment: Appointment): Promise<void> {
    const data: AppointmentCheckoutParams = { appointmentUuid: appointment.uuid };
    this.navCtrl.push(PageNames.AppointmentCheckout, data);
  }

  /**
   * Handler for appointment-checkout appointment when we come back from check out page.
   */
  checkedOutProcess(appointmentUuid: string): void {
    if (appointmentUuid) {
      this.todayService.setAppointment(appointmentUuid, { status: AppointmentStatuses.checked_out });
    }
  }

  /**
   * Handler for cancel appointment event
   */
  async cancelAppointment(appointment: Appointment): Promise<void> {
    const loader = this.loadingCtrl.create();
    loader.present();

    await this.todayService.setAppointment(appointment.uuid, { status: AppointmentStatuses.cancelled_by_stylist });

    this.updateTodayPage(false, () => {
      loader.dismiss();
    });
  }
}
