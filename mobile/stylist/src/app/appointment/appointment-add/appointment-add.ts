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
import { AppointmentDate } from '~/appointment/appointment-date/appointment-dates-service-mock';

import {
  ClearClientsAction,
  ClientsState,
  SearchAction,
  selectFoundClients
} from '~/appointment/appointment-add/clients.reducer';

import {
  ClearSelectedServiceAction,
  selectSelectedService,
  ServicesState
} from '~/appointment/appointment-services/services.reducer';

import {
  selectSelectedDate
} from '~/appointment/appointment-date/appointment-dates.reducer';

@IonicPage()
@Component({
  selector: 'page-appointment-add',
  templateUrl: 'appointment-add.html'
})
export class AppointmentAddComponent {
  moment = moment;

  form: FormGroup;
  selectedClient?: Client;
  selectedDate?: AppointmentDate;
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
        }
      });

    this.store
      .select(selectFoundClients)
      .takeUntil(componentUnloaded(this))
      .subscribe(clients => {
        this.clientsList = clients;
      });

    this.store
      .select(selectSelectedDate)
      .takeUntil(componentUnloaded(this))
      .subscribe(selectedDate => {
        this.selectedDate = selectedDate;
      });
  }

  search(): void {
    const { client: query } = this.form.value;
    if (query.trim().length >= 2) { // type 2 symbols to search
      this.store.dispatch(new SearchAction(query));
    }
  }

  getClientFullName(client: Client): string | void {
    return client && `${client.first_name} ${client.last_name}`;
  }

  clearSelectedClient(): void {
    const { client: query } = this.form.value;
    const isNewClient = this.selectedClient && this.getClientFullName(this.selectedClient) !== query.trim();
    if (isNewClient) {
      delete this.selectedClient;
    }
  }

  clearClientsList(): void {
    setTimeout(() => { // allows selecting client
      delete this.clientsList;
    });
  }

  selectClient(client: Client): void {
    this.selectedClient = client;
    this.form.patchValue({
      client: this.getClientFullName(client),
      phone: client.phone
    });
    this.clearClientsList();
  }

  selectService(event): void {
    this.navCtrl.push(PageNames.AppointmentService);
    event.preventDefault(); // prevents submit
  }

  selectDate(event): void {
    this.navCtrl.push(PageNames.AppointmentDate);
    event.preventDefault(); // prevents submit
  }

  async submit(forced = false): Promise<void> {
    const { client, phone, time } = this.form.value;
    const date = moment(this.selectedDate.date).format('YYYY-MM-DD');

    let clientData;
    if (this.selectedClient) {
      clientData = { client_uuid: this.selectedClient.uuid };
    } else {
      const [ firstName, lastName ] = client.trim().split(/(^[^\s]+)/).slice(-2);
      clientData = {
        client_phone: phone,
        client_first_name: firstName,
        client_last_name: lastName.trim() // remove leading \s
      };
    }

    const data = {
      ...clientData,
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
      this.store.dispatch(new ClearClientsAction());
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
      phone: ['', [Validators.required]],
      time: ['', [Validators.required]]
    });
  }
}
