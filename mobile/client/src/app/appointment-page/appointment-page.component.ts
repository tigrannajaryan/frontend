import { Component } from '@angular/core';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';

import { AppointmentChangeRequest, AppointmentStatus, ClientAppointmentModel } from '~/shared/api/appointments.models';
import { CheckOutService, ServiceFromAppointment } from '~/shared/api/stylist-app.models';
import { ISODate, isoDateFormat } from '~/shared/api/base.models';
import { formatTimeInZone } from '~/shared/utils/string-utils';

import { AppointmentsApi } from '~/core/api/appointments.api';
import { PageNames } from '~/core/page-names';

import { AppointmentsDataStore } from '~/core/api/appointments.datastore';
import { BookingApi, CreateAppointmentRequest } from '~/core/api/booking.api';
import { BookingData } from '~/core/api/booking.data';
import { PaymentsApi } from '~/core/api/payments.api';
import { PaymentMethod, PaymentType } from '~/core/api/payments.models';

import { AddServicesComponentParams } from '~/add-services/add-services.component';
import { AppointmentPriceComponentParams } from '~/appointment-price/appointment-price.component';
import {
  checkStylistAvailability,
  confirmRebook,
  reUseAppointment,
  showNoTimeSlotsPopup
} from '~/booking/booking-utils';
import { BookingCompleteComponentParams } from '~/booking/booking-complete/booking-complete.component';
import { ConfirmCheckoutComponentParams } from '~/confirm-checkout/confirm-checkout.component';

import { ENV } from '~/environments/environment.default';

export interface AppointmentPageParams {
  appointment: ClientAppointmentModel;
  onCancel?: Function;
  hasRebook?: boolean;
  isRescheduling?: boolean;
}

export enum AppointmentAttribute {
  booking,
  rescheduling,
  checkout,
  reBook,
  futureAppointment,
  editAppointmentButtons,
  withRating,
  withoutRating,
  withComment
}

/*
  AppointmentAttribute describe how appointment appears
  what can be on this page and what can't
+-----------------------------------+
|                                   |
|                                   |
|                                   |
|                                   |
|                                   |
|                                   |
| +-------------------------------+ |
| |                               | |
| |    |editAppointmentButtons|   | |
| |      and/or                   | |
| |    |futureAppointment|        | |
| |      and/or                   | |
| |    |withoutRating|            | |
| |      and/or                   | |
| |    |withRating|               | |
| |      and/or                   | |
| |    |withComment|              | |
| |                               | |
| +---------------+---------------+ |
|                 |                 |
|                 +                 |
|                and                |
|                 +                 |
|                 |                 |
| +---------------+---------------+ |
| |                               | |
| |      |booking|                | |
| |        or                     | |
| |      |rescheduling|           | |
| |        or                     | |
| |      |checkout|               | |
| |        or                     | |
| |      |reBook|                 | |
| |                               | |
| +-------------------------------+ |
+-----------------------------------+

*/

@Component({
  selector: 'page-appointment',
  templateUrl: 'appointment-page.component.html'
})
export class AppointmentPageComponent {
  ffEnableIncomplete = ENV.ffEnableIncomplete;

  AppointmentAttribute = AppointmentAttribute;
  AppointmentStatus = AppointmentStatus;
  formatTimeInZone = formatTimeInZone;
  PaymentType = PaymentType;

  params: AppointmentPageParams;

  isRescheduling = false;
  rescheduledTime: ISODate;

  payment: PaymentMethod;

  constructor(
    private api: AppointmentsApi,
    private alertCtrl: AlertController,
    private appointmentsDataStore: AppointmentsDataStore,
    private bookingApi: BookingApi,
    private bookingData: BookingData,
    private navCtrl: NavController,
    private navParams: NavParams,
    private paymentsApi: PaymentsApi
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.params = this.navParams.get('params') as AppointmentPageParams;

    if (this.params.appointment.uuid && !this.params.isRescheduling) {
      // no uuid if booking in progress
      const { response } = await this.api.getAppointment(this.params.appointment.uuid).toPromise();
      if (response) {
        // Re-new appointment
        // TODO: pass only appointmentUuid to the component?
        this.params.appointment = response;
      }
    }

    const { response: paymentsResponse } = await this.paymentsApi.getPaymentMethods().toPromise();
    if (paymentsResponse) {
      // Assuming there can be only one payment method which is a payment by card
      this.payment = paymentsResponse.payment_methods[0];
    }
  }

  isAppointmentInBooking(): boolean {
    return (
      this.params &&
      this.params.appointment &&
      !this.params.appointment.uuid
    );
  }

  hasAttribute(appointmentTmpType: AppointmentAttribute): boolean {
    const appointmentTmp: AppointmentAttribute[] = [];
    const appointment = this.params && this.params.appointment;
    const appointmentStatus = this.params.appointment.status;

    if (!appointment.uuid) {
      // IF this appointment have no uuid then this is booking
      appointmentTmp.push(AppointmentAttribute.booking);
    } else {
      // IF this appointment have uuid
      if (appointmentStatus !== AppointmentStatus.no_show) {
        // !no_show???

        if (this.params.isRescheduling) {
          // IF this is rescheduling flow
          appointmentTmp.push(AppointmentAttribute.rescheduling);
        } else if (appointmentStatus !== AppointmentStatus.checked_out && this.isTodayAppointment()) {
          // IF this appointment is today and it has status not checked_out
          appointmentTmp.push(AppointmentAttribute.checkout);
        } else if (this.params.hasRebook) {
          // IF this is past appointment
          appointmentTmp.push(AppointmentAttribute.reBook);
        }
      }

      if (appointmentStatus === AppointmentStatus.new) {
        if (!this.isTodayAppointment() && this.params.onCancel) {
          // IF this is new future appointment
          appointmentTmp.push(AppointmentAttribute.futureAppointment);
        }
      }

      if (appointmentStatus === AppointmentStatus.checked_out) {
        // IF this appointment is already checked_out

        if (appointment.rating === null && appointment.comment === null) {
          // and withoutRating rating
          appointmentTmp.push(AppointmentAttribute.withoutRating);
        }

        if (appointment.rating) {
          // and with rating
          appointmentTmp.push(AppointmentAttribute.withRating);
        }

        if (appointment.comment) {
          // and with comment
          appointmentTmp.push(AppointmentAttribute.withComment);
        }
      } else {
        // IF this appointment is not checked_out yet

        if (this.isTodayAppointment()) {
          // and only for today appointments
          appointmentTmp.push(AppointmentAttribute.editAppointmentButtons);
        }
      }
    }

    return appointmentTmp.indexOf(appointmentTmpType) !== -1;
  }

  isTodayAppointment(): boolean {
    const appointment = this.params && this.params.appointment;
    return (
      Boolean(appointment) &&
      moment().format(isoDateFormat) === moment(appointment.datetime_start_at).format(isoDateFormat)
    );
  }

  isAbleToCheckoutAppointment(): boolean {
    return (
      this.params &&
      this.params.appointment &&
      this.params.appointment.status !== AppointmentStatus.checked_out &&
      this.isTodayAppointment()
    );
  }

  isPaymentShown(): boolean {
    return (
      ENV.ffEnableIncomplete &&
      (
        this.isAppointmentInBooking() ||
        this.isAbleToCheckoutAppointment()
      )
    );
  }

  onAddPaymentClick(): void {
    this.navCtrl.push(PageNames.AddCard);
  }

  async onConfirmClick(): Promise<void> {
    const appointmentRequest: CreateAppointmentRequest = {
      stylist_uuid: this.bookingData.stylist.uuid,
      datetime_start_at: this.bookingData.selectedTime.format(),
      services: this.bookingData.selectedServices.map(s => ({
        service_uuid: s.uuid
      }))
    };

    if (!this.params.isRescheduling) {
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
    } else {
      // this is rescheduling we want to update current appointment
      const { response: updateAppointmentResponse } = await this.api.updateAppointment(
        this.params.appointment.uuid,
        this.params.appointment
      ).toPromise();

      if (updateAppointmentResponse) {
        const params: BookingCompleteComponentParams = {
          appointment: updateAppointmentResponse,
          isRescheduling: true
        };
        this.navCtrl.push(PageNames.BookingComplete, { params });
      }
    }

    // Appointment succesfully created. Refresh Home screen.
    this.appointmentsDataStore.home.refresh();
  }

  async onReUseAppointmentClick(isRescheduling: boolean): Promise<void> {
    const isConfirmed = await confirmRebook(this.params.appointment);
    if (isConfirmed) {

      if (isRescheduling && await checkStylistAvailability(this.params.appointment.stylist_uuid)) {
        // if this is rescheduling click and current stylist have NO available slots
        showNoTimeSlotsPopup([{
          text: 'Keep Appointment',
          cssClass: 'notAvailablePopup-btn'
        }, {
          text: 'Cancel Appointment',
          cssClass: 'notAvailablePopup-btn is-warn',
          handler: () => {
            this.onCancelClick();
          }
        }]);

        // do nothing
        return;
      }

      // remove this view from navigation stack
      this.navCtrl.pop();
      reUseAppointment(this.params.appointment, isRescheduling);
    }
    console.warn(4);
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

  async onCheckoutAndPay(): Promise<void> {
    this.onCheckout(this.payment);
  }

  async onCheckout(payment: PaymentMethod): Promise<void> {
    const request: AppointmentChangeRequest = {
      status: AppointmentStatus.checked_out,
      has_card_fee_included: false,
      has_tax_included: true,
      payment_method_uuid: payment ? payment.uuid : undefined,
      pay_via_made: payment ? true : undefined
    };
    const { response } = await this.api.changeAppointment(this.params.appointment.uuid, request).toPromise();
    if (response) {
      const params: ConfirmCheckoutComponentParams = {
        appointment: this.params.appointment
      };

      this.navCtrl.push(PageNames.ConfirmCheckout, { params });
    }
  }

  async onAddServices(services: ServiceFromAppointment[]): Promise<void> {
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
