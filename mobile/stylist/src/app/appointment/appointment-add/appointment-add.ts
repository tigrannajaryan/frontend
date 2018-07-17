import * as moment from 'moment';

import { Store } from '@ngrx/store';
import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { predicateValidator } from '~/shared/validators';
import { loading } from '~/core/utils/loading';
import { showAlert } from '~/core/utils/alert';
import { componentUnloaded } from '~/shared/component-unloaded';
import { PageNames } from '~/core/page-names';
import { ServiceItem } from '~/core/stylist-service/stylist-models';

import { Client } from '~/appointment/appointment-add/clients-models';
import { HomeService as AppointmentService } from '~/home/home.service';
import { AppointmentDateOffer } from '~/home/home.models';

import {
  ClearClientsAction,
  ClearSelectedClientAction,
  ClientsState,
  SearchAction,
  SelectClientAction,
  selectFoundClients,
  selectSelectedClient
} from '~/appointment/appointment-add/clients.reducer';

import {
  ClearSelectedServiceAction,
  selectSelectedService,
  ServicesState
} from '~/appointment/appointment-services/services.reducer';

import {
  ClearSelectedDateAction,
  selectSelectedDate
} from '~/appointment/appointment-date/appointment-dates.reducer';
import { UserOptions } from '~/core/user-options';

const helpText = `You added an appointment for a future day, it will not be visible on this screen.
          You can see future appointments by tapping <strong>Total This Week</strong>`;

@IonicPage()
@Component({
  selector: 'page-appointment-add',
  templateUrl: 'appointment-add.html'
})
export class AppointmentAddComponent {
  form: FormGroup;
  selectedClient?: Client;
  selectedDate?: AppointmentDateOffer;
  selectedService?: ServiceItem;

  // labels
  protected selectServiceLabel = 'Select from service list';
  protected selectDateLabel = 'Choose date';

  protected clientsList?: Client[];
  protected minuteValues = Array(12).fill(undefined).map((_, idx) => idx * 5).toString(); // every 5 minutes

  constructor(
    private alertCtrl: AlertController,
    private appointmentService: AppointmentService,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private store: Store<ServicesState & ClientsState>,
    private userOptions: UserOptions
  ) {
  }

  ionViewWillLoad(): void {
    this.createForm();

    this.store
      .select(selectSelectedService)
      .takeUntil(componentUnloaded(this))
      .subscribe(selectedService => {
        this.selectedService = selectedService;
        this.form.patchValue({
          service: selectedService ? selectedService.name : this.selectServiceLabel
        });
      });

    this.store
      .select(selectFoundClients)
      .takeUntil(componentUnloaded(this))
      .subscribe(clients => {
        this.clientsList = clients;
      });

    this.store
      .select(selectSelectedClient)
      .takeUntil(componentUnloaded(this))
      .subscribe(client => {
        this.selectedClient = client;
      });

    this.store
      .select(selectSelectedDate)
      .takeUntil(componentUnloaded(this))
      .subscribe(selectedDate => {
        this.selectedDate = selectedDate;
        this.form.patchValue({
          date: selectedDate ? moment(selectedDate.date).format('D MMMM, YYYY') : this.selectDateLabel
        });
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
    this.store.dispatch(new SelectClientAction(client));
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
      let alertMsg = '';
      const alertAdditionalBtns = [];

      if (errorMessage instanceof Map && errorMessage.size > 0) {
        alertMsg = Array.from(errorMessage.values())[0][0].code; // show first message

        if (errorMessage.has('datetime_start_at') && errorMessage.size === 1) { // when only datetime error
          alertAdditionalBtns.push({
            text: 'Add anyway',
            handler: () => this.submit(true)
          });
        }
      } else {
        alertMsg = errorMessage.toString();
      }

      const alert = this.alertCtrl.create({
        title: 'Adding appointment failed',
        subTitle: alertMsg,
        buttons: ['Dismiss', ...alertAdditionalBtns]
      });
      alert.present();
    }
  }

  isServiceExist = () => Boolean(this.selectedService);
  isDateSet = () => Boolean(this.selectedDate);

  @loading
  private async createAppointment(data, forced): Promise<any> {
    try {
      await this.appointmentService.createAppointment(data, forced);

      // clear all data
      // TODO: submit with action and use effect to clear relative data
      this.store.dispatch(new ClearClientsAction());
      this.store.dispatch(new ClearSelectedClientAction());
      this.store.dispatch(new ClearSelectedServiceAction());
      this.store.dispatch(new ClearSelectedDateAction());

      this.navCtrl.pop();

      const isFutureAppointment = moment(data.datetime_start_at).isAfter(new Date());
      if (isFutureAppointment && this.userOptions.get('showFutureAppointmentHelp')) {
        showAlert('', helpText, [{
          text: 'Don\'t show again',
          handler: () => {
            this.userOptions.set('showFutureAppointmentHelp', false);
          }
        }]);
      }
    } catch (e) {
      if (e.errors instanceof Map) {
        return e.errors; // js Map
      }
      return e.message; // string
    }
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      client: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      service: [this.selectServiceLabel, [predicateValidator(this.isServiceExist)]],
      date: [this.selectDateLabel, [predicateValidator(this.isDateSet)]],
      time: ['', [Validators.required]]
    });
  }
}
