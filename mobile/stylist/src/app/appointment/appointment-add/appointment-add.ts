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
  ClearSelectedServiceAction,
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

  async submit(forced = false): Promise<void> {
    const { client, date, time } = this.form.value;
    const [ firstName, lastName ] = client.trim().split(/(^[^\s]+)/).slice(-2);
    const data = {
      client_first_name: firstName,
      client_last_name: lastName.trim(), // remove leading \s
      services: [{ service_uuid: this.selectedService.uuid }],
      datetime_start_at: `${date}T${time}:00`
    };

    const errorMessage = await this.createAppointment(data, forced);

    if (errorMessage) {
      const validAddAppointmentErrors = [
        // TODO: check on some error code, not error text msg
        'Cannot add appointment for a past date and time',
        'Cannot add appointment intersecting with another',
        'Cannot add appointment outside working hours'
      ];
      const hasAddAnyway = validAddAppointmentErrors.indexOf(errorMessage) !== -1;
      const alertAdditionalBtns = [];

      if (hasAddAnyway) {
        alertAdditionalBtns.push({
          text: 'Add anyway',
          handler: () => this.submit(true)
        });
      }

      const alert = this.alertCtrl.create({
        title: 'Adding appointment failed',
        subTitle: errorMessage,
        buttons: ['Dismiss', ...alertAdditionalBtns]
      });
      alert.present();
    }
  }

  @loading
  private async createAppointment(data, forced): Promise<any> {
    try {
      await this.appointmentService.createAppointment(data, forced);
      this.store.dispatch(new ClearSelectedServiceAction());
      this.navCtrl.pop();
    } catch (e) {
      const dateTimeError = e.errors && e.errors.get('datetime_start_at');
      if (dateTimeError) {
        return dateTimeError[0] ? dateTimeError[0].code : e.message;
      }
      return e.message;
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
