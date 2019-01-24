import { Component } from '@angular/core';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';

import { AppointmentChangeRequest, AppointmentStatus, ClientAppointmentModel } from '~/shared/api/appointments.models';
import { CheckOutService, ServiceFromAppointment } from '~/shared/api/stylist-app.models';
import { isoDateFormat } from '~/shared/api/base.models';
import { formatTimeInZone } from '~/shared/utils/string-utils';

import { AppointmentsApi } from '~/core/api/appointments.api';
import { PageNames } from '~/core/page-names';

import { AppointmentsDataStore } from '~/core/api/appointments.datastore';
import { BookingApi, CreateAppointmentRequest } from '~/core/api/booking.api';
import { BookingData } from '~/core/api/booking.data';

import { AddServicesComponentParams } from '~/add-services/add-services.component';
import { AppointmentPriceComponentParams } from '~/appointment-price/appointment-price.component';
import { confirmRebook, startRebooking } from '~/booking/booking-utils';
import { BookingCompleteComponentParams } from '~/booking/booking-complete/booking-complete.component';

export interface AppointmentPageParams {
  appointment: ClientAppointmentModel;
  onCancel?: Function;
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

  constructor(
    private alertCtrl: AlertController,
    private api: AppointmentsApi,
    private appointmentsDataStore: AppointmentsDataStore,
    private bookingApi: BookingApi,
    private bookingData: BookingData,
    private navCtrl: NavController,
    private navParams: NavParams) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.params = this.navParams.get('params');

    if (this.params.appointment.uuid) { // no uuid if booking in progress
      const { response } = await this.api.getAppointment(this.params.appointment.uuid).toPromise();
      if (response) {
        // Re-new appointment
        // TODO: pass only appointmentUuid to the component?
        this.params.appointment = response;
      }
    }
  }

  isTodayAppointment(): boolean {
    const appointment = this.params && this.params.appointment;
    return (
      Boolean(appointment) &&
      moment().format(isoDateFormat) === moment(appointment.datetime_start_at).format(isoDateFormat)
    );
  }

  async onConfirmClick(): Promise<void> {
    const appointmentRequest: CreateAppointmentRequest = {
      stylist_uuid: this.bookingData.stylist.uuid,
      datetime_start_at: this.bookingData.selectedTime.format(),
      services: this.bookingData.selectedServices.map(s => ({
        service_uuid: s.uuid
      }))
    };

    // First, create appointment.
    const { response: createAppointmentResponse } = await this.bookingApi.createAppointment(appointmentRequest).toPromise();

    if (createAppointmentResponse) {
      // Appointment succesfully created. Refresh Home screen.
      this.appointmentsDataStore.home.refresh();

      // Show "booking complete" message.
      const params: BookingCompleteComponentParams = {
        appointment: createAppointmentResponse
      };
      this.navCtrl.push(PageNames.BookingComplete, { params });
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
    const params: AddServicesComponentParams = {
      appointment: this.params.appointment,
      selectedServices: this.params.appointment.services,
      onComplete: this.onAddServices.bind(this)
    };

    this.navCtrl.push(PageNames.AddServices, { params });
  }

  onChangePrice(appointment: ClientAppointmentModel): void {
    const params: AppointmentPriceComponentParams = { appointment };
    this.navCtrl.push(PageNames.AppointmentPrice, { params });
  }

  async onCheckout(): Promise<void> {
    const request: AppointmentChangeRequest = {
      status: AppointmentStatus.checked_out,
      has_card_fee_included: false,
      has_tax_included: false
    };
    const { response } = await this.api.changeAppointment(this.params.appointment.uuid, request).toPromise();
    if (response) {
      this.navCtrl.push(PageNames.ConfirmCheckout);
    }
  }

  private async onAddServices(services: ServiceFromAppointment[]): Promise<void> {
    const checkoutServices: CheckOutService[] = services.map(service => ({ service_uuid: service.service_uuid }));

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
      // Update services storred in booking data
      this.bookingData.setSelectedServices(
        services.map(service => ({
          uuid: service.service_uuid,
          name: service.service_name,
          base_price: service.regular_price
        }))
      );

      // No appointment on the backend, recreate it using preview API
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
