import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

import { FeedbackComponentParams } from '~/feed-back/feed-back.component';
import { PageNames } from '~/core/page-names';
import { Logger } from '~/shared/logger';
import { AppointmentChangeRequest, ClientAppointmentModel } from '~/shared/api/appointments.models';
import { AppointmentsApi } from '~/core/api/appointments.api';

@Component({
  selector: 'made-thumbs',
  templateUrl: 'made-thumbs.component.html'
})
export class MadeThumbsComponent {
  @Input() appointment: ClientAppointmentModel;
  @Input() popAfterSubmit: boolean;

  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    private api: AppointmentsApi
  ) {}

  async goToFeedBack(isThumbsUp: boolean): Promise<void> {
    try {
      const request: AppointmentChangeRequest = {
        rating: Number(isThumbsUp)
      };
      const { response } = await this.api.changeAppointment(this.appointment.uuid, request).toPromise();

      if (response) {
        const params: FeedbackComponentParams = {
          appointment: response,
          popAfterSubmit: this.popAfterSubmit
        };
        this.navCtrl.push(PageNames.FeedBack, { params });
      }
    } catch (e) {
      this.logger.error('Cannot go to FeedBack page because of error in POST rating request');
    }
  }
}
