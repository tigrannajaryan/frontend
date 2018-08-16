import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';

import { Logger } from '~/shared/logger';
import { formatTimeInZone } from '~/shared/utils/string-utils';
import { AppointmentModel, AppointmentStatus } from '~/core/api/appointments.models';

export interface AppointmentPageParams {
  appointment: AppointmentModel;
  hasConfirmButton: boolean;
  onCancelClick?: Function;
  onConfirmClick?: Function;
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
  hasConfirmButton: boolean;
  appointment: AppointmentModel;

  constructor(
    private logger: Logger,
    private alertCtrl: AlertController,
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

  onRebookClick(): void {
    // remove this view from navigation stack
    this.navCtrl.pop();

    // TODO: begin appointment creation flow when the screens are ready
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
          handler: data => {
            // TODO: call appointment delete API when it is ready

            // navigate back
            this.navCtrl.pop();

            // Let caller know
            if (this.params.onCancelClick) {
              this.params.onCancelClick();
            }
          }
        }
      ]
    });
    alert.present();
  }
}
