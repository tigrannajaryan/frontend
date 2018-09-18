import * as moment from 'moment';

import { Store } from '@ngrx/store';
import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { componentUnloaded } from '~/shared/component-unloaded';
import { ServiceItem } from '~/shared/stylist-api/stylist-models';
import { HomeService as AppointmentService } from '~/shared/stylist-api/home.service';

import { loading } from '~/core/utils/loading';
import { PageNames } from '~/core/page-names';

import {
  ClearSelectedServiceAction,
  selectSelectedService,
  ServicesState
} from '~/appointment/appointment-services/services.reducer';

import { ApiFieldAndNonFieldErrors, FieldErrorItem } from '~/shared/api-errors';
import { FieldErrorCode } from '~/shared/api-error-codes';

function isOverridableError(errorCodeStr: FieldErrorCode): boolean {
  return errorCodeStr === 'err_appointment_in_the_past' ||
    errorCodeStr === 'err_appointment_outside_working_hours' ||
    errorCodeStr === 'err_appointment_non_working_day' ||
    errorCodeStr === 'err_appointment_intersection';
}

@IonicPage()
@Component({
  selector: 'page-appointment-add',
  templateUrl: 'appointment-add.html'
})
export class AppointmentAddComponent {
  form: FormGroup;
  selectedService?: ServiceItem;

  defaultDate = moment(new Date()).format('YYYY-MM-DD');
  defaultTime = '09:00';
  minuteValues = Array(4).fill(undefined).map((_, idx) => idx * 15).toString(); // every 15 minutes

  constructor(
    private alertCtrl: AlertController,
    private appointmentService: AppointmentService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private store: Store<ServicesState>
  ) {
  }

  ionViewWillLoad(): void {
    this.createForm();

    this.store
      .select(selectSelectedService)
      .takeUntil(componentUnloaded(this))
      .subscribe(selectedService => {
        this.selectedService = selectedService;
      });
  }

  selectService(): void {
    this.navCtrl.push(PageNames.AppointmentServices);
  }

  protected onSubmit(forced = false): void {
    const { client, phone, date, time } = this.form.value;
    const dateYMD = moment(date).format('YYYY-MM-DD');

    const [firstName, lastName] = client.trim().split(/(^[^\s]+)/).slice(-2);
    const clientData = {
      client_phone: phone,
      client_first_name: firstName,
      client_last_name: lastName.trim()
    };

    const data = {
      ...clientData,
      services: this.selectedService ? [{ service_uuid: this.selectedService.uuid }] : [],
      datetime_start_at: `${dateYMD}T${time}:00`
    };

    this.createAppointment(data, forced);
  }

  private showErrorMsg(e: ApiFieldAndNonFieldErrors): void {
    const alertAdditionalBtns = [];
    let canOverride = false;
    // Check if it is one specific error and it is overridable
    if (e.errors.length === 1) {
      const error = e.errors[0];
      if (error instanceof FieldErrorItem && isOverridableError(error.error.code)) {
        // Add a button to allow overriding.
        canOverride = true;
        alertAdditionalBtns.push({
          text: 'Add anyway',
          handler: () => this.onSubmit(true)
        });
      }
    }

    // Convert newlines to <br/>
    const alertMsg = e.getMessage().replace(/\n/gm, '<br/>');

    const alert = this.alertCtrl.create({
      title: canOverride ? 'Warning' : 'Error',
      subTitle: alertMsg,
      buttons: ['Dismiss', ...alertAdditionalBtns]
    });
    alert.present();
  }

  @loading
  private async createAppointment(data, forced): Promise<any> {
    try {
      // We will handle ApiFieldAndNonFieldErrors ourselves, so tell API to not show alerts
      const options = { hideGenericAlertOnFieldAndNonFieldErrors: true };

      await this.appointmentService.createAppointment(data, forced, options);

      // clear selected service data
      this.store.dispatch(new ClearSelectedServiceAction());

      // and close this view
      this.navCtrl.pop();

    } catch (e) {
      if (e instanceof ApiFieldAndNonFieldErrors) {
        // Process our specific errors here
        this.showErrorMsg(e);
      } else {
        // Let generic error handler to take care of the rest
        throw e;
      }
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      client: ['', [Validators.required]],
      phone: [''],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]]
    });
  }
}
