import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, ModalController, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Loading } from 'ionic-angular/components/loading/loading';

import {
  LoadAction,
  selectTodayState,
  TodayState
} from './today.reducer';

import { Today } from './today.models';
import { Appointment } from '~/today/today.models';
import { TodayService } from '~/today/today.service';
import { PageNames } from '~/core/page-names';

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
  // this should be here if we using enum in html
  protected AppointmentStatuses = AppointmentStatuses;
  hasBlur = false;
  today: Today;

  private stateSubscription: Subscription;

  constructor(
    public navCtrl: NavController,
    public todayService: TodayService,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private store: Store<TodayState>
  ) {
  }

  ionViewDidEnter(): void {
    this.updateTodayPage();
  }

  ionViewDidLeave(): void {
    // Unsubscribe from observer when this view is no longer visible
    // to avoid unneccessary processing.
    this.stateSubscription.unsubscribe();

    // unblur on ionViewDidLeave
    this.hasBlur = false;
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

  /**
   * Handler for appointment card click event.
   */
  changeCheckedStatus(appointmentNode: Element, status: boolean): void {
    appointmentNode['isChecked'] = status;
    this.hasBlur = status;
  }

  /**
   * Handler for appointment-checkout appointment event.
   */
  async checkOutAppointment(appointment: Appointment, appointmentNode: Element): Promise<void> {
    const loader = this.loadingCtrl.create();
    loader.present();

    const checkoutModal = this.modalCtrl.create(PageNames.AppointmentCheckout, { uuid: appointment.uuid });
    await checkoutModal.present();

    this.changeCheckedStatus(appointmentNode, false);

    checkoutModal.onDidDismiss(async (isCheckedOut: boolean) => {
      if (isCheckedOut) {
        await this.todayService.setAppointment(appointment.uuid, { status: AppointmentStatuses.checked_out });

        await this.updateTodayPage(false);
      }

      loader.dismiss();
    });
  }

  /**
   * Handler for cancel appointment event
   */
  async cancelAppointment(appointment: Appointment, appointmentNode: Element): Promise<void> {
    const loader = this.loadingCtrl.create();
    loader.present();

    this.changeCheckedStatus(appointmentNode, false);

    await this.todayService.setAppointment(appointment.uuid, { status: AppointmentStatuses.cancelled_by_stylist });

    this.updateTodayPage(false, () => {
      loader.dismiss();
    });
  }
}
