import { Component } from '@angular/core';
import { AlertController, NavController, NavParams } from 'ionic-angular';

import { ServiceFromAppointment } from '~/shared/api/stylist-app.models';
import { formatTimeInZone } from '~/shared/utils/string-utils';

import { AppointmentsApi } from '~/core/api/appointments.api';
import { PageNames } from '~/core/page-names';

import {
  AppointmentModel,
  AppointmentStatus,
  CheckOutService
} from '~/core/api/appointments.models';
import { BookingApi } from '~/core/api/booking.api';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';

import { AddServicesComponentParams } from '~/add-services/add-services.component';
import { AppointmentPriceComponentParams } from '~/appointment-price/appointment-price.component';
import { confirmRebook, startRebooking } from '~/booking/booking-utils';

export interface AppointmentPageParams {
  appointment: AppointmentModel;
  onCancel?: Function;
  onConfirmClick?: Function;
  hasRebook?: boolean;
}

@Component({
  selector: 'page-appointment',
  templateUrl: 'appointment-page.component.html'
})
export class AppointmentPageComponent {

  AppointmentStatus = AppointmentStatus;
  formatTimeInZone = formatTimeInZone;

  params: AppointmentPageParams;

  // Details show minified as a default to keep more space empty
  isMinifiedDetails = true;

  constructor(
    private alertCtrl: AlertController,
    private api: AppointmentsApi,
    private appointmentsDataStore: AppointmentsDataStore,
    private bookingApi: BookingApi,
    private navCtrl: NavController,
    private navParams: NavParams) {
  }

  ionViewWillEnter(): void {
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
          handler: () => {
            this.onDoCancel();
          }
        }
      ]
    });
    alert.present();
  }

  async onDoCancel(): Promise<void> {
    const { error } = await this.api.cancelAppointment(this.params.appointment).get();
    if (!error) {
      // Let caller know
      if (this.params.onCancel) {
        this.params.onCancel();
      }

      // navigate back
      this.navCtrl.pop();
    }
  }

  onChangeServices(): void {
    const data: AddServicesComponentParams = {
      appointment: this.params.appointment,
      selectedServices: this.params.appointment.services,
      onComplete: this.onAddServices.bind(this)
    };

    this.navCtrl.push(PageNames.AddServices, { data });
  }

  onChangePrice(appointment: AppointmentModel): void {
    const params: AppointmentPriceComponentParams = { appointment };
    this.navCtrl.push(PageNames.AppointmentPrice, { params });
  }

  triggerMinifiedDetails(): void {
    this.isMinifiedDetails = !this.isMinifiedDetails;
  }

  private async onAddServices(services: ServiceFromAppointment[]): Promise<void> {
    const checkoutServices: CheckOutService[] = [];

    for (const service of services) {
      checkoutServices.push({ service_uuid: service.service_uuid });
    }

    if (this.params.appointment.uuid) {
      // Update services in the appointment on the backend
      const { response } = await this.api.changeAppointment(
        this.params.appointment.uuid, { services: checkoutServices }
      ).toPromise();

      if (response) {
        // Update appointment we show to a client
        this.params.appointment = response;

        this.renewAppointmentsList();

        // Close add services page
        this.navCtrl.pop();
      }

    } else {
      // No appointment on the backend, recreate it usiang preview API
      // just as like as at is used in the end of the booking process,
      const { response } = await this.bookingApi.previewAppointment({
        stylist_uuid: this.params.appointment.stylist_uuid,
        datetime_start_at: this.params.appointment.datetime_start_at,
        services: services.map(({ service_uuid }) => ({ service_uuid }))
      }).toPromise();

      if (response) {
        // Update appointment
        this.params.appointment = response;

        this.renewAppointmentsList();

        // Close add services page
        this.navCtrl.pop();
      }
    }
  }

  /**
   * Update appointments list to ensure appointment’s updates are reflected there too.
   */
  private renewAppointmentsList(): void {
    this.appointmentsDataStore.home.get();
    this.appointmentsDataStore.history.get();
  }
}
