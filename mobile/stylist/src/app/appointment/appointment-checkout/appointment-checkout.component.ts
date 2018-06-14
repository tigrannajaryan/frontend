import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TodayService } from '~/today/today.service';
import {
  Appointment,
  AppointmentPreviewRequest,
  AppointmentPreviewResponse,
  AppointmentService,
  AppointmentStatuses,
  CheckOut,
  CheckOutService
} from '~/today/today.models';
import { loading } from '~/core/utils/loading';

export interface AppointmentCheckoutParams {
  appointmentUuid: string;
  services?: AppointmentService[];
}

@IonicPage({ segment: 'appointment-checkout/:appointmentUuid' })
@Component({
  selector: 'page-checkout',
  templateUrl: 'appointment-checkout.component.html'
})
export class AppointmentCheckoutComponent {
  protected appointment: Appointment;
  protected previewResponse: AppointmentPreviewResponse;
  private params: AppointmentCheckoutParams;
  private hasTaxIncluded: boolean;
  private hasCardFeeIncluded: boolean;

  static getServicesUuid(services: AppointmentService[]): CheckOutService[] {
    return services.map(item => ({ service_uuid: item.service_uuid }));
  }

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private todayService: TodayService
  ) {
  }

  ionViewWillEnter(): void {
    this.init();
  }

  async init(): Promise<void> {
    this.params = await this.navParams.data as AppointmentCheckoutParams;

    if (this.params) {
      if (this.params.appointmentUuid) {
        this.appointment = await this.todayService.getAppointmentById(this.params.appointmentUuid);
        this.hasTaxIncluded = this.appointment.has_tax_included;
        this.hasCardFeeIncluded = this.appointment.has_card_fee_included;
      }

      if (this.params.services) {
        this.appointment.services = this.params.services;
      }
    }

    await this.updatePreview();
  }

  @loading
  async updatePreview(): Promise<void> {
    let services = [];
    if (this.previewResponse && this.previewResponse.services) {
      services = AppointmentCheckoutComponent.getServicesUuid(this.previewResponse.services);
    } else {
      services = AppointmentCheckoutComponent.getServicesUuid(this.appointment.services);
    }
    const appointmentPreview: AppointmentPreviewRequest = {
      appointment_uuid: this.params.appointmentUuid,
      datetime_start_at: this.appointment.datetime_start_at,
      services,
      has_tax_included: this.hasTaxIncluded,
      has_card_fee_included: this.hasCardFeeIncluded
    };

    this.previewResponse = await this.todayService.getAppointmentPreview(appointmentPreview) as AppointmentPreviewResponse;
    this.hasTaxIncluded = this.previewResponse.has_tax_included;
    this.hasCardFeeIncluded = this.previewResponse.has_card_fee_included;
  }

  protected confirmCheckout(): void {
    const checkOut: CheckOut = {
      status: AppointmentStatuses.checked_out,
      services: AppointmentCheckoutComponent.getServicesUuid(this.appointment.services),
      has_tax_included: this.hasTaxIncluded,
      has_card_fee_included: this.hasCardFeeIncluded
    };

    const data = {
      appointmentUuid: this.params.appointmentUuid,
      body: checkOut
    };

    this.navCtrl.push('ConfirmCheckoutComponent', data);
  }

  protected removeServiceItem(services: AppointmentService[], i: number): void {
    services.splice(i, 1);

    this.updatePreview();
  }

  protected addServices(): void {
    const services: CheckOutService[] = AppointmentCheckoutComponent.getServicesUuid(this.appointment.services);

    const data = {
      appointmentUuid: this.params.appointmentUuid,
      services
    };

    this.navCtrl.push('AddServicesComponent', data);
  }

  // TODO: uncomment when api will be ready
  // protected changeServiceItem(services: AppointmentService[], i: number): void {
  //   const buttons = [
  //     {
  //       text: 'Edit',
  //       handler: () => {
  //         this.editServiceIem(services[i]);
  //       }
  //     }, {
  //       text: 'Delete Service',
  //       role: 'destructive',
  //       handler: () => {
  //         this.removeServiceItem(services, i);
  //       }
  //     }, {
  //       text: 'Cancel',
  //       role: 'cancel'
  //     }
  //   ];
  //
  //   const actionSheet = this.actionSheetCtrl.create({ buttons });
  //   actionSheet.present();
  // }
  //
  // protected editServiceIem(services: AppointmentService): void {
  //   const prompt = this.alertCtrl.create({
  //     title: 'Edit service price',
  //     inputs: [
  //       {
  //         name: 'client_price',
  //         value: `${services.client_price}`,
  //         placeholder: 'Price'
  //       }
  //     ],
  //     buttons: [
  //       { text: 'Cancel' },
  //       {
  //         text: 'Save',
  //         handler: data => {
  //           services.client_price = data.client_price;
  //         }
  //       }
  //     ]
  //   });
  //   prompt.present();
  // }
}
