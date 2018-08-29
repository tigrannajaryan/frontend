import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { HomeService } from '~/home/home.service';
import {
  Appointment,
  AppointmentChangeRequest,
  AppointmentPreviewRequest,
  AppointmentPreviewResponse,
  AppointmentService,
  AppointmentStatuses,
  CheckOutService
} from '~/home/home.models';
import { PageNames } from '~/core/page-names';
import { AddServicesComponentParams } from '~/core/popups/add-services/add-services.component';
import { ServiceItem } from '~/core/stylist-service/stylist-models';

export interface AppointmentCheckoutParams {
  appointmentUuid: string;
  isAlreadyCheckedOut?: boolean;
}

/**
 * This screen shows the appointment that we are about to checkout
 * and shows the preview of total price, tax, card fee, the list
 * of included services and allows modifying the list.
 */
@IonicPage({ segment: 'appointment-checkout/:appointmentUuid' })
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

  // The state of 2 toggles for tax and card fee
  hasTaxIncluded: boolean;
  hasCardFeeIncluded: boolean;

  subTotalRegularPrice: number;

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
        this.appointment = await this.homeService.getAppointmentById(this.params.appointmentUuid);
        this.selectedServices = this.appointment.services.map(el => ({ service_uuid: el.service_uuid }));
        this.hasTaxIncluded = true; // Enable tax by default
        this.hasCardFeeIncluded = this.appointment.has_card_fee_included;
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

    try {
      this.isLoading = true;
      const appointmentPreview: AppointmentPreviewRequest = {
        appointment_uuid: this.params.appointmentUuid,
        datetime_start_at: this.appointment.datetime_start_at,
        services: this.selectedServices,
        has_tax_included: this.hasTaxIncluded,
        has_card_fee_included: this.hasCardFeeIncluded
      };

      this.previewResponse = await this.homeService.getAppointmentPreview(appointmentPreview) as AppointmentPreviewResponse;
      this.subTotalRegularPrice = this.previewResponse.services.reduce((a, c) => (a + c.regular_price), 0);
    } finally {
      this.isLoading = false;
    }
  }

  removeServiceClick(service: AppointmentService): void {
    const i = this.selectedServices.findIndex(el => el.service_uuid === service.service_uuid);
    if (i >= 0) {
      this.selectedServices.splice(i, 1);
    }

    this.updatePreview();
  }

  addServicesClick(): void {
    const data: AddServicesComponentParams = {
      appointmentUuid: this.params.appointmentUuid,
      selectedServices: this.selectedServices,
      onComplete: this.onAddServices.bind(this)
    };

    this.navCtrl.push(PageNames.AddServicesComponent, { data });
  }

  /**
   * This callback is called by AddServicesComponent when it is about to close.
   */
  onAddServices(addedServices: ServiceItem[]): void {
    // Update list of selected services
    this.selectedServices = addedServices.map(serviceItem => ({ service_uuid: serviceItem.service_uuid }));

    // Close AddServicesComponent page and show this page
    this.navCtrl.pop();
  }

  async finalizeCheckoutClick(): Promise<void> {
    const request: AppointmentChangeRequest = {
      status: AppointmentStatuses.checked_out,
      services: this.selectedServices,
      has_card_fee_included: this.hasCardFeeIncluded,
      has_tax_included: this.hasTaxIncluded
    };

    await this.homeService.changeAppointment(this.params.appointmentUuid, request);

    // Replace current page with checkout confirmation page. We push the new page first
    // and then remove the current page to avoid 2 UI transitions.
    const current = this.navCtrl.length() - 1;
    this.navCtrl.push(PageNames.ConfirmCheckoutComponent);
    this.navCtrl.remove(current);
  }
}
