import * as moment from 'moment';

import { Store } from '@ngrx/store';
import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { loading } from '~/core/utils/loading';
import { componentUnloaded } from '~/core/utils/component-unloaded';
import { PageNames } from '~/core/page-names';
import { ServiceItem } from '~/core/stylist-service/stylist-models';

import { Client } from '~/appointment/appointment-add/clients-models';
import { TodayService as AppointmentService } from '~/today/today.service';

import {
  ClientsState,
  selectFoundClients
} from '~/appointment/appointment-add/clients.reducer';

import {
  selectSelectedService,
  ServicesState
} from '~/appointment/appointment-services/services.reducer';

@IonicPage()
@Component({
  selector: 'page-appointment-add',
  templateUrl: 'appointment-add.html'
})
export class AppointmentAddComponent {
  form: FormGroup;
  selectedClient?: Client;
  selectedService?: ServiceItem;

  protected clientsList?: Client[];

  protected moment = moment; // use directly in template
  protected minuteValues = Array(12).fill(undefined).map((_, idx) => idx * 5).toString(); // every 5 minutes

  constructor(
    private alertCtrl: AlertController,
    private appointmentService: AppointmentService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private store: Store<ServicesState & ClientsState>
  ) {
  }

  ionViewWillLoad(): void {
    this.createForm();

    this.store
      .select(selectSelectedService)
      .takeUntil(componentUnloaded(this))
      .subscribe(service => {
        if (service !== undefined) {
          this.selectedService = service;
          this.form.patchValue({ service: service.name });
        }
      });

    this.store
      .select(selectFoundClients)
      .takeUntil(componentUnloaded(this))
      .subscribe(clients => {
        this.clientsList = clients;
      });
  }

  selectClient(client: Client): void {
    this.selectedClient = client;
    this.form.patchValue({ client: `${client.first_name} ${client.last_name}` });
    delete this.clientsList;
  }

  selectService(): void {
    this.navCtrl.push(PageNames.AppointmentService);
  }

  @loading
  async submit(): Promise<void> {
    const { client, date, time } = this.form.value;
    const [ firstName, lastName ] = client.trim().split(/(^[^\s]+)/).slice(-2);
    const tz = (new Date()).getTimezoneOffset() / 60 * -1;
    const tzAbs = `0${Math.abs(tz)}`.slice(-2);
    const data = {
      client_first_name: firstName,
      client_last_name: lastName.trim(), // remove leading \s
      services: [{ service_uuid: this.selectedService.uuid }],
      datetime_start_at: `${date}T${time}:00${tz < 0 ? '-' : '+'}${tzAbs}:00`
    };
    try {
      await this.appointmentService.createAppointment(data);
      this.navCtrl.pop();
    } catch (e) {
      let errorMessage = e.message;

      const dateTimeError = e.errors && e.errors.get('datetime_start_at');
      if (dateTimeError) {
        errorMessage = dateTimeError[0] && dateTimeError[0].code;
      }

      const alert = this.alertCtrl.create({
        title: 'Adding appointment failed',
        subTitle: errorMessage,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      client: ['', [Validators.required]],
      service: ['', [Validators.required]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]]
    });
  }
}
