import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { HomeService } from '~/core/api/home.service';
import {
  Appointment,
  AppointmentChangeRequest,
  AppointmentPreviewRequest,
  AppointmentPreviewResponse,
  AppointmentStatuses,
  CheckOutService
} from '~/core/api/home.models';
import { ServiceFromAppointment } from '~/shared/api/stylist-app.models';

import { PageNames } from '~/core/page-names';
import { AddServicesComponentParams } from '~/core/popups/add-services/add-services.component';

import { AppointmentPriceComponentParams } from '~/appointment/appointment-price/appointment-price.component';

export interface AppointmentCheckoutParams {
  appointmentUuid: string;
  isAlreadyCheckedOut?: boolean;
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

  // The following field is returned by the server as a result
  // of us asking for a preview of what the appointment will look
  // like if we checkout using provided list of services.
  previewResponse: AppointmentPreviewResponse;

  // The details of the appointment
  appointment: Appointment;

  // Tax included by default
  hasTaxIncluded = true;

  subTotalRegularPrice: number;

  // Details show minified as a default to keep more space empty
  isMinifiedDetails = true;

  isLoading = false;
  AppointmentStatuses = AppointmentStatuses;

  // The initial state of this screen that we need to show
  params: AppointmentCheckoutParams;

  // Services that are currently selected for this checkout
  // and are visible on screen.
  private selectedServices: CheckOutService[];

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private homeService: HomeService
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    try {
      this.isLoading = true;
      if (!this.params) {
        // Entering this view for the first time. Load the data.
        this.params = this.navParams.get('data') as AppointmentCheckoutParams;
        this.appointment = (await this.homeService.getAppointmentById(this.params.appointmentUuid).get()).response;
        if (this.appointment) {
          this.selectedServices = this.appointment.services.map(el => ({ service_uuid: el.service_uuid }));
        }
      }
      await this.updatePreview();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Sends currently selected set of services and calculation options
   * to the backend and receives a preview of final total price, etc,
   * then updates the screen with received data.
   */
  async updatePreview(): Promise<void> {

    if (!this.appointment) {
      return;
    }

    try {
      this.isLoading = true;
      const appointmentPreview: AppointmentPreviewRequest = {
        appointment_uuid: this.params.appointmentUuid,
        datetime_start_at: this.appointment.datetime_start_at,
        services: this.selectedServices,
        has_tax_included: this.hasTaxIncluded,
        has_card_fee_included: false
      };

      this.previewResponse = (await this.homeService.getAppointmentPreview(appointmentPreview).get()).response;
      if (this.previewResponse) {
        this.subTotalRegularPrice = this.previewResponse.services.reduce((a, c) => (a + c.regular_price), 0);
      }
    } finally {
      this.isLoading = false;
    }
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

    // And update preview
    await this.updatePreview();
  }

  async onFinalizeCheckoutClick(): Promise<void> {
    const request: AppointmentChangeRequest = {
      ...this.getChangeAppointmentRequestParams(),
      status: AppointmentStatuses.checked_out
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

  onChangePrice(appointment: Appointment): void {
    const params: AppointmentPriceComponentParams = {
      appointment,
      preview: this.previewResponse
    };
    this.navCtrl.push(PageNames.AppointmentPrice, { params });
  }

  triggerMinifiedDetails(): void {
    this.isMinifiedDetails = !this.isMinifiedDetails;
  }

  private getChangeAppointmentRequestParams(): AppointmentChangeRequest {
    return {
      status: this.appointment.status,
      services: this.selectedServices,
      has_tax_included: this.hasTaxIncluded,
      has_card_fee_included: false
    };
  }
}
