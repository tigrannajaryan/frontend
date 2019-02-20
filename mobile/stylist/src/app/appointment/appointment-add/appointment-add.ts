import * as moment from 'moment';

import { Store } from '@ngrx/store';
import { Component } from '@angular/core';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { componentUnloaded } from '~/shared/component-unloaded';
import { ServiceItem } from '~/shared/api/stylist-app.models';
import { HomeService as AppointmentService } from '~/core/api/home.service';

import { WorktimeApi } from '~/core/api/worktime.api';
import { loading } from '~/core/utils/loading';
import { PageNames } from '~/core/page-names';

import {
  ClearSelectedServiceAction,
  selectSelectedService,
  ServicesState
} from '~/appointment/appointment-services/services.reducer';

import { ApiFieldAndNonFieldErrors, FieldErrorItem } from '~/shared/api-errors';
import { FieldErrorCode } from '~/shared/api-error-codes';
import { isoDateFormat } from '~/shared/api/base.models';
import { MadeDisableOnClick } from '~/shared/utils/loading';

function isOverridableError(errorCodeStr: FieldErrorCode): boolean {
  return errorCodeStr === 'err_appointment_in_the_past' ||
    errorCodeStr === 'err_appointment_outside_working_hours' ||
    errorCodeStr === 'err_appointment_non_working_day' ||
    errorCodeStr === 'err_appointment_intersection';
}

export interface AppointmentAddParams {
  startDate?: moment.Moment; // If specified preselects this date
  startDateTime?: moment.Moment; // If specified preselects this date and time
}

@Component({
  selector: 'page-appointment-add',
  templateUrl: 'appointment-add.html'
})
export class AppointmentAddComponent {
  form: FormGroup;
  selectedService?: ServiceItem;
  params: AppointmentAddParams;

  isBlockedSlot = new FormControl(false);
  isBlockedFullDay = new FormControl(false);

  defaultDate = moment(new Date()).format(isoDateFormat);
  defaultTime = '09:00';
  startDate = '';
  startTime = '';
  nextYear = moment().add(1, 'years').format(isoDateFormat);
  minuteValues = Array(4).fill(undefined).map((_, idx) => idx * 15).toString(); // every 15 minutes

  constructor(
    private alertCtrl: AlertController,
    private appointmentService: AppointmentService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private navParams: NavParams,
    private store: Store<ServicesState>,
    private worktimeApi: WorktimeApi
  ) {
  }

  ionViewWillLoad(): void {
    this.params = this.navParams.get('params') || {};

    if (this.params.startDateTime) {
      this.defaultDate = this.startDate = this.params.startDateTime.format(isoDateFormat);
      this.defaultTime = this.startTime = this.params.startDateTime.format('HH:mm');
    } else if (this.params.startDate) {
      this.defaultDate = this.startDate = this.params.startDate.format(isoDateFormat);
    }

    this.createForm();

    this.store
      .select(selectSelectedService)
      .takeUntil(componentUnloaded(this))
      .subscribe((selectedService: ServiceItem) => {
        this.selectedService = selectedService;
      });

    this.subscribeToIsBlockedChanges();
  }

  @MadeDisableOnClick
  async selectService(): Promise<void> {
    await this.navCtrl.push(PageNames.AppointmentServices);
  }

  async onSubmit(forced = false): Promise<void> {
    const { client, date, phone, time } = this.form.value;
    const dateYMD = moment(date).format('YYYY-MM-DD');

    const isBlockedSlot = this.isBlockedSlot.value;
    const isBlockedFullDay = this.isBlockedFullDay.value;

    if (isBlockedFullDay) {
      this.blockFullDay(moment(date));

    } else if (isBlockedSlot) {
      this.createAppointment({
        client_phone: '',
        client_first_name: '',
        client_last_name: '',
        datetime_start_at: `${dateYMD}T${time}:00`,
        services: []
      }, forced);

    } else {
      const [firstName, lastName] = client ? client.trim().split(/(^[^\s]+)/).slice(-2) : ['', ''];
      const clientData = {
        client_phone: phone,
        client_first_name: firstName,
        client_last_name: lastName.trim()
      };

      this.createAppointment({
        ...clientData,
        datetime_start_at: `${dateYMD}T${time}:00`,
        services: this.selectedService ? [{ service_uuid: this.selectedService.uuid }] : []
      }, forced);
    }
  }

  private subscribeToIsBlockedChanges(): void {
    this.isBlockedSlot.valueChanges
      .takeUntil(componentUnloaded(this))
      .map((isBlockedSlot: boolean) => {
        // Only one toggled can exist:
        if (isBlockedSlot && this.isBlockedFullDay.value) {
          this.isBlockedFullDay.patchValue(false);
        }
      })
      .subscribe();

    this.isBlockedFullDay.valueChanges
      .takeUntil(componentUnloaded(this))
      .map((isBlockedFullDay: boolean) => {
        // Time is not required if full day is blocked, remove validation:
        this.form.controls.time.setValidators(isBlockedFullDay ? [] : [Validators.required]);
        this.form.controls.time.updateValueAndValidity();
        return isBlockedFullDay;
      })
      .map((isBlockedFullDay: boolean) => {
        // Only one toggled can exist:
        if (isBlockedFullDay && this.isBlockedSlot.value) {
          this.isBlockedSlot.patchValue(false);
        }
      })
      .subscribe();
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

  private async blockFullDay(date: moment.Moment): Promise<any> {
    const { response } = await this.worktimeApi.setWorkdayAvailable(date, false).toPromise();

    if (response) {
      this.navCtrl.pop();
    }
  }

  @loading
  private async createAppointment(data, forced): Promise<any> {
    // We will handle ApiFieldAndNonFieldErrors ourselves, so tell API to not show alerts
    const options = { hideGenericAlertOnFieldAndNonFieldErrors: true };

    const { error } = await this.appointmentService.createAppointment(data, forced, options).get();
    if (error) {
      if (error instanceof ApiFieldAndNonFieldErrors) {
        // Process our specific errors here
        this.showErrorMsg(error);
      } else {
        // Let generic error handler to take care of the rest
      }
      return;
    }

    // clear selected service data
    this.store.dispatch(new ClearSelectedServiceAction());

    // and close this view
    this.navCtrl.pop();
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      client: [''],
      phone: [''],
      date: [this.startDate, [Validators.required]],
      time: [this.startTime, [Validators.required]]
    });
  }
}
