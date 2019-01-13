import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ClientAppointmentModel } from '~/shared/api/appointments.models';
import { AbstractAppointmentPriceComponent } from '~/shared/components/appointment/abstract-appointment-price.component';
import { loading } from '~/shared/utils/loading';

import { AppointmentsApi } from '~/core/api/appointments.api';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';

export interface AppointmentPriceComponentParams {
  appointment: ClientAppointmentModel;
}

@Component({
  selector: 'appointment-price',
  templateUrl: 'appointment-price.component.html'
})
export class AppointmentPriceComponent extends AbstractAppointmentPriceComponent {
  appointment: ClientAppointmentModel;

  constructor(
    protected api: AppointmentsApi,
    protected appointmentsDataStore: AppointmentsDataStore,
    protected navCtrl: NavController,
    protected navParams: NavParams
  ) {
    super();
  }

  ionViewWillEnter(): void {
    const params = this.navParams.get('params') as AppointmentPriceComponentParams;

    this.appointment = params && params.appointment;

    if (this.appointment) {
      // Get initial preview
      this.updatePreview();
    }
  }

  async updatePreview(): Promise<void> {
    const { response } = await loading(this,
      this.api.getAppointmentPreview({
        appointment_uuid: this.appointment.uuid,
        stylist_uuid: this.appointment.stylist_uuid,
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
    if (this.appointment.uuid) {
      // Do update on the backend
      const { response } = await this.api.changeAppointment(
        this.appointment.uuid,
        {
          services: this.getServicesWithPrices(),
          price_change_reason: this.priceChangeReason.value
        }
      ).toPromise();

      if (response) {
        this.appointment = response;

        // Update appointments list to ensure appointment’s updates are reflected there too
        this.appointmentsDataStore.home.get();
        this.appointmentsDataStore.history.get();

        this.navCtrl.pop();
      }

    } else if (this.preview) {
      // Update locally based on last preview
      this.appointment.grand_total = this.preview.grand_total;
      this.appointment.total_client_price_before_tax = this.preview.total_client_price_before_tax;
      this.appointment.total_tax = this.preview.total_tax;
      this.appointment.total_card_fee = this.preview.total_card_fee;
      this.appointment.tax_percentage = this.preview.tax_percentage;
      this.appointment.card_fee_percentage = this.preview.card_fee_percentage;
      this.appointment.services = this.preview.services;

      this.navCtrl.pop();
    }
  }
}
