import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { AppointmentChangeRequest, ClientAppointmentModel } from '~/shared/api/appointments.models';
import { AppointmentsApi } from '~/core/api/appointments.api';

export interface FeedbackComponentParams {
  appointment: ClientAppointmentModel;
  popAfterSubmit: boolean;
}

@Component({
  selector: 'page-feedback',
  templateUrl: 'feed-back.component.html'
})
export class FeedBackComponent {
  params: FeedbackComponentParams;
  comment: string;
  thumbsUp: boolean;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private api: AppointmentsApi
  ) {
  }

  ionViewDidEnter(): void {
    this.params = this.navParams.get('params') as FeedbackComponentParams;
    // from the backend we have a string, we need to convert it to boolean
    const rating = Number(this.params.appointment.rating);
    this.thumbsUp = Boolean(rating);
  }

  async onSubmit(): Promise<void> {
    const data: AppointmentChangeRequest = {
      rating: Number(this.params.appointment.rating),
      comment: this.comment
    };

    await this.api.changeAppointment(this.params.appointment.uuid, data).toPromise();

    if (this.params.popAfterSubmit) {
      // pop to previous page
      // case: past appointments
      this.navCtrl.pop();
    } else {
      // pop to root
      // case: after checkout
      this.navCtrl.popToRoot();
    }
  }
}
