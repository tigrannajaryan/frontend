import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import 'rxjs/add/operator/debounceTime';

import { StylistAppointmentModel } from '~/shared/api/appointments.models';
import { AbstractAppointmentPriceComponent } from '~/shared/components/appointment/abstract-appointment-price.component';
import { loading } from '~/shared/utils/loading';

import { HomeService } from '~/core/api/home.service';

export interface AppointmentPriceComponentParams {
  appointment: StylistAppointmentModel;
}

@Component({
  selector: 'appointment-price',
  templateUrl: 'appointment-price.component.html'
})
export class AppointmentPriceComponent extends AbstractAppointmentPriceComponent {
  appointment: StylistAppointmentModel;

  constructor(
    private api: HomeService,
    private navCtrl: NavController,
    private navParams: NavParams
  ) {
    super();
  }

  ionViewWillEnter(): void {
    const { appointment } = this.navParams.get('params') as AppointmentPriceComponentParams;

    this.appointment = appointment;

    if (this.appointment) {
      // Get initial preview
      this.updatePreview();
    }
  }

  async updatePreview(): Promise<void> {
    const { response } = await loading(this,
      this.api.getAppointmentPreview({
        appointment_uuid: this.appointment.uuid,
        datetime_start_at: this.appointment.datetime_start_at,
        services: this.getServicesWithPrices(),
        has_tax_included: false,
        has_card_fee_included: false
      })
    );

    if (response) {
      this.preview = response;
    }
  }

  async onSave(): Promise<void> {
    const { response } = await this.api.changeAppointment(
      this.appointment.uuid,
      {
        services: this.getServicesWithPrices(),
        price_change_reason: this.priceChangeReason.value
      }
    ).toPromise();

    if (response) {
      this.navCtrl.pop();
    }
  }
}
