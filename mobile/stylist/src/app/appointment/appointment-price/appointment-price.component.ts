import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';
import 'rxjs/add/operator/debounceTime';

import { componentUnloaded } from '~/shared/component-unloaded';
import { loading } from '~/shared/utils/loading';

import {
  Appointment,
  AppointmentPreviewResponse,
  CheckOutService
} from '~/core/api/home.models';
import { HomeService } from '~/core/api/home.service';

export interface Sale {
  amount: string;
  percentage: string;
}

export function getSale(preview: AppointmentPreviewResponse): Sale {
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
    amount: saleAmount.toString(),
    percentage: salePercentage.toFixed()
  };
}

export interface AppointmentPriceComponentParams {
  appointment: Appointment;
  preview: AppointmentPreviewResponse;
}

@Component({
  selector: 'appointment-price',
  templateUrl: 'appointment-price.component.html'
})
export class AppointmentPriceComponent implements OnInit {
  getSale = getSale;

  appointment: Appointment;
  preview: AppointmentPreviewResponse;

  isLoading = false;
  form: FormGroup;

  priceChangeReason: FormControl = new FormControl('');

  constructor(
    private api: HomeService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private navParams: NavParams
  ) {
  }

  ngOnInit(): void {
    const { appointment, preview } = this.navParams.get('params') as AppointmentPriceComponentParams;

    this.appointment = appointment;
    this.preview = preview;

    if (this.preview) {
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
    const { response } = await this.api.changeAppointment(
      this.appointment.uuid,
      {
        status: this.appointment.status, // not changed
        services: this.getServicesWithPrices(),
        price_change_reason: this.priceChangeReason.value
      }
    ).toPromise();

    if (response) {
      this.navCtrl.pop();
    }
  }

  updatePreview = async (): Promise<void> => {
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
}
