import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';

import { Logger } from '~/shared/logger';
import { formatTimeInZone } from '~/shared/utils/string-utils';
import { AppointmentModel, AppointmentStatus } from '~/core/api/appointments.models';
import { AppointmentsApi } from '~/core/api/appointments.api';
import { confirmRebook, startRebooking } from '~/booking/booking-utils';

export interface AppointmentPageParams {
  appointment: AppointmentModel;
  onCancel?: Function;
  onConfirmClick?: Function;
  hasRebook?: boolean;
}

@IonicPage()
@Component({
  selector: 'page-appointment',
  templateUrl: 'appointment-page.component.html'
})
export class AppointmentPageComponent {

  AppointmentStatus = AppointmentStatus;
  formatTimeInZone = formatTimeInZone;

  params: AppointmentPageParams;

  constructor(
    private alertCtrl: AlertController,
    private api: AppointmentsApi,
    private logger: Logger,
    private navCtrl: NavController,
    private navParams: NavParams) {
  }

  ionViewDidLoad(): void {
    this.logger.info('AppointmentPageComponent.ionViewDidLoad');
  }

  ionViewWillEnter(): void {
    this.logger.info('AppointmentPageComponent.ionViewWillEnter');
    this.params = this.navParams.get('params');
  }

  onConfirmClick(): void {
    if (this.params.onConfirmClick) {
      this.params.onConfirmClick();
    }
  }

  async onRebookClick(): Promise<void> {
    const isConfirmed = await confirmRebook(this.params.appointment);
    if (isConfirmed) {
      // remove this view from navigation stack
      this.navCtrl.pop();

      startRebooking(this.params.appointment);
    }
  }

  onCancelClick(): void {
    const alert = this.alertCtrl.create({
      message: 'Are you sure you want to cancel this appointment?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: data => { this.onDoCancel(); }
        }
      ]
    });
    alert.present();
  }

  async onDoCancel(): Promise<void> {
    const { error } = await this.api.cancelAppointment(this.params.appointment).toPromise();
    if (!error) {
      // Let caller know
      if (this.params.onCancel) {
        this.params.onCancel();
      }

      // navigate back
      this.navCtrl.pop();
    }
  }
}
