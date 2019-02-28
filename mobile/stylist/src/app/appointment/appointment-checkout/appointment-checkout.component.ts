import { Component } from '@angular/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';
import { Validators } from '@angular/forms';
import * as moment from 'moment';

import {
  AppointmentChangeRequest,
  AppointmentPreviewRequest,
  AppointmentPreviewResponse,
  AppointmentStatus,
  StylistAppointmentModel
} from '~/shared/api/appointments.models';
import {
  CheckOutService,
  ServiceFromAppointment, StylistSettings, StylistSettingsKeys
} from '~/shared/api/stylist-app.models';
import { InputTypes, isoDateFormat } from '~/shared/api/base.models';

import { HomeService } from '~/core/api/home.service';
import { StylistServiceProvider } from '~/core/api/stylist.service';
import { PageNames } from '~/core/page-names';
import { AddServicesComponentParams } from '~/core/popups/add-services/add-services.component';

import { AppointmentPriceComponentParams } from '~/appointment/appointment-price/appointment-price.component';
import { GetPaidPopupComponent, GetPaidPopupParams } from '~/appointment/get-paid-popup/get-paid-popup.component';
import { SettingsFieldComponentParams } from '~/settings/settings-field/settings-field.component';
import { loading } from '~/shared/utils/loading';

export interface AppointmentCheckoutParams {
  appointmentUuid: string;
  isReadonly?: boolean;
}

/**
 * This screen shows the appointment that we are about to checkout
 * and shows the preview of total price, tax, card fee, the list
 * of included services and allows modifying the list.
 */
@Component({
  selector: 'page-checkout',
  templateUrl: 'appointment-checkout.component.html'
})
export class AppointmentCheckoutComponent {
  settings: StylistSettings;

  // The details of the appointment
  appointment: StylistAppointmentModel;

  // Change Services/Price true should be only for
  // not findished (checked_out or no_show) and isTodayAppointment appointment
  hasServicesPriceBtn = false;

  isLoading = false;
  AppointmentStatus = AppointmentStatus;

  // The initial state of this screen that we need to show
  params: AppointmentCheckoutParams;

  // Services that are currently selected for this checkout
  // and are visible on screen.
  private selectedServices: CheckOutService[];

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private homeService: HomeService,
    private stylistService: StylistServiceProvider
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    this.params = this.navParams.get('params') as AppointmentCheckoutParams;

    const settingsResponse = await this.stylistService.getStylistSettings().toPromise();
    if (settingsResponse && settingsResponse.response) {
      this.settings = settingsResponse.response;
    }
    debugger;

    await this.loadAppointment(this.params.appointmentUuid);
  }

  addServicesClick(): void {
    const params: AddServicesComponentParams = {
      appointmentUuid: this.params.appointmentUuid,
      selectedServices: this.selectedServices,
      onComplete: this.onAddServices.bind(this)
    };

    this.navCtrl.push(PageNames.AddServicesComponent, { params });
  }

  /**
   * This callback is called by AddServicesComponent when it is about to close.
   */
  async onAddServices(addedServices: ServiceFromAppointment[]): Promise<void> {
    // Update list of selected services
    this.selectedServices = addedServices.map(service => ({ service_uuid: service.service_uuid }));

    // Save changes to the appointment
    const { response } = await this.homeService.changeAppointment(
      this.params.appointmentUuid,
      this.getChangeAppointmentRequestParams()
    ).get();

    if (!response) {
      return;
    }
    this.appointment = response;

    // Close AddServicesComponent page and show this page
    this.navCtrl.pop();
  }

  async onCheckoutAndPay(): Promise<void> {
    await this.onFinalizeCheckoutClick(true);
  }

  async onFinalizeCheckoutClick(payViaMade = false): Promise<void> {
    const request: AppointmentChangeRequest = {
      ...this.getChangeAppointmentRequestParams(),
      status: AppointmentStatus.checked_out,
      pay_via_made: payViaMade
    };

    const { response } = await this.homeService.changeAppointment(this.params.appointmentUuid, request).get();
    if (!response) {
      return;
    }

    // Replace current page with checkout confirmation page. We push the new page first
    // and then remove the current page to avoid 2 UI transitions.
    const current = this.navCtrl.length() - 1;
    this.navCtrl.push(PageNames.ConfirmCheckoutComponent);
    this.navCtrl.remove(current);
  }

  onChangePrice(appointment: StylistAppointmentModel): void {
    const params: AppointmentPriceComponentParams = { appointment };
    this.navCtrl.push(PageNames.AppointmentPrice, { params });
  }

  onTaxEdit(): void {
    const params: SettingsFieldComponentParams = {
      title: 'Tax Rate Percentage',
      name: StylistSettingsKeys.tax_percentage,
      inputType: InputTypes.number,
      value: [
        this.appointment.tax_percentage,
        [
          Validators.required,
          Validators.pattern(/^(\d{1,2})(\.\d{1,3})?$/)
        ]
      ],
      onSave: async (val: number) => {
        this.appointment.tax_percentage = val;
        const settings: StylistSettings = {
          tax_percentage: val,
          card_fee_percentage: this.appointment.card_fee_percentage
        };
        // Update the tax in stylist’s settings
        await this.stylistService.setStylistSettings(settings).toPromise();

        // Re-new appointment data
        await this.loadAppointment(this.appointment.uuid);
      }
    };
    this.navCtrl.push(PageNames.SettingsField, { params });
  }

  onHowToGetPaid(): void {
    const params: GetPaidPopupParams = { appointment: this.appointment };
    const popup = this.modalCtrl.create(GetPaidPopupComponent, { params });
    popup.present();
  }

  isFinishedAppointment(appointment: StylistAppointmentModel): boolean {
    return (
      Boolean(appointment)
      && [AppointmentStatus.checked_out, AppointmentStatus.no_show].indexOf(appointment.status) !== -1
    );
  }

  isTodayAppointment(appointment: StylistAppointmentModel): boolean {
    return (
      Boolean(appointment) &&
      moment().format(isoDateFormat) === moment(appointment.datetime_start_at).format(isoDateFormat)
    );
  }

  private async loadAppointment(appointmentUuid: string): Promise<void> {
    const { response: appointment } = await loading(this, this.homeService.getAppointmentById(appointmentUuid).toPromise());
    if (appointment) {
      // Save services to be used in change appointment requests
      // (see onAddServices() and getChangeAppointmentRequestParams()).
      this.selectedServices = appointment.services.map(el => ({ service_uuid: el.service_uuid }));
      // Indicate to show or not to show change services/price buttons.
      // Buttons are shown when
      // - the date of the appointment is today
      // - and when the appointment is not finished (not checked out or marked as no-show).
      const finishedAppointment = this.isFinishedAppointment(appointment);
      this.hasServicesPriceBtn = !finishedAppointment && this.isTodayAppointment(appointment);
      // Get appointment preview with newest tax settings.
      if (!finishedAppointment) {
        // After appointment was created the tax setting of the stylist might have been changed.
        if (appointment.tax_percentage !== this.settings.tax_percentage) {
          // To be sure the tax is newest/latest we use preview appointment API edpoint.
          const preview = await this.getPreview(appointment);
          // Update appointment values.
          if (preview) {
            appointment.tax_percentage = preview.tax_percentage;
            appointment.total_tax = preview.total_tax;
            appointment.grand_total = preview.grand_total;
          }
        }
      }
      // Save appointment. Placed in the bottom to show it in the view with updated preview-depenedent values.
      this.appointment = appointment;
    }
  }

  private async getPreview(appointment: StylistAppointmentModel): Promise<AppointmentPreviewResponse> {
    const appointmentPreview: AppointmentPreviewRequest = {
      appointment_uuid: appointment.uuid,
      datetime_start_at: appointment.datetime_start_at,
      services: this.selectedServices,
      has_tax_included: true,
      has_card_fee_included: false
    };
    const { response } = await loading(this, this.homeService.getAppointmentPreview(appointmentPreview));
    return response;
  }

  private getChangeAppointmentRequestParams(): AppointmentChangeRequest {
    return {
      status: this.appointment.status,
      services: this.selectedServices,
      has_tax_included: true,
      has_card_fee_included: false
    };
  }
}
