import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';
import 'rxjs/add/operator/debounceTime';

import { componentUnloaded } from '~/shared/component-unloaded';
import { loading } from '~/shared/utils/loading';

import {
  AppointmentModel,
  AppointmentPreviewResponse,
  CheckOutService
} from '~/core/api/appointments.models';
import { AppointmentsApi } from '~/core/api/appointments.api';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';

export interface DiscountDescr {
  amount: number;
  percentage: number;
}

export function getDiscountDescr(preview: AppointmentPreviewResponse): DiscountDescr {
  if (!preview) {
    return;
  }

  let regularPrice = 0;
  let clientPrice = 0;

  for (const service of preview.services) {
    regularPrice += service.regular_price;
    clientPrice += service.client_price;
  }

  if (regularPrice === 0 || clientPrice === 0) {
    return;
  }

  const saleAmount = regularPrice - clientPrice;
  if (saleAmount < 0) {
    return;
  }

  const salePercentage = (saleAmount / regularPrice) * 100;

  return {
    amount: saleAmount,
    percentage: parseInt(salePercentage.toFixed(), 10)
  };
}

export interface AppointmentPriceComponentParams {
  appointment: AppointmentModel;
}

@Component({
  selector: 'appointment-price',
  templateUrl: 'appointment-price.component.html'
})
export class AppointmentPriceComponent implements OnInit {
  getDiscountDescr = getDiscountDescr;

  appointment: AppointmentModel;
  preview: AppointmentPreviewResponse;

  isLoading = false;
  form: FormGroup;

  priceChangeReason: FormControl = new FormControl('');

  constructor(
    private api: AppointmentsApi,
    private appointmentsDataStore: AppointmentsDataStore,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private navParams: NavParams
  ) {
  }

  ngOnInit(): void {
    const params = this.navParams.get('params') as AppointmentPriceComponentParams;
    this.appointment = params && params.appointment;

    if (this.appointment) {
      // ControlsConfig is a collection of child controls. The key for each child is the name
      // under which it is registered. It is supplied to FormBuilder.group(…) call.
      // https://github.com/angular/angular/blob/7.1.4/packages/forms/src/form_builder.ts#L32-L33
      const controlsConfig: { [key: string]: any; } = {};

      for (const service of this.appointment.services) {
        controlsConfig[service.service_uuid] = ['', [
          Validators.pattern(/\d*/)
        ]];
      }

      this.form = this.formBuilder.group(controlsConfig);

      this.form.valueChanges
        .takeUntil(componentUnloaded(this))
        .debounceTime(500)
        .subscribe(this.updatePreview);
    }
  }

  getServiceName(serviceUuid: string): string {
    const service = this.appointment.services.find(
      ({ service_uuid }) => service_uuid === serviceUuid
    );
    if (service) {
      return service.service_name;
    }
    return '';
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
        this.renewAppointmentsList();

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

  updatePreview = async (): Promise<void> => {
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
  };

  private getServicesWithPrices(): CheckOutService[] {
    const services: CheckOutService[] = [];

    for (const serviceUuid of Object.keys(this.form.value)) {
      const value = this.form.value[serviceUuid].trim();
      services.push({
        service_uuid: serviceUuid,
        client_price: value ? parseInt(value, 10) : undefined
      });
    }

    return services;
  }

  /**
   * Update appointments list to ensure appointment’s updates are reflected there too.
   */
  private renewAppointmentsList(): void {
    this.appointmentsDataStore.home.get();
    this.appointmentsDataStore.history.get();
  }
}
