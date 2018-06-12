import * as faker from 'faker';
import * as moment from 'moment';

import { async, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Store, StoreModule } from '@ngrx/store';

import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { TestUtils } from '~/../test';

import { TodayService as AppointmentService } from '~/today/today.service';

import { ServiceItem } from '~/core/stylist-service/stylist-models';
import { clientsMock } from '~/appointment/appointment-add/clients-service-mock';
import { SelectServiceAction, servicesReducer, ServicesState } from '~/appointment/appointment-services/services.reducer';
import { clientsReducer, ClientsState, SearchSuccessAction } from '~/appointment/appointment-add/clients.reducer';

import { AppointmentAddComponent } from './appointment-add';

let fixture: ComponentFixture<AppointmentAddComponent>;
let instance: AppointmentAddComponent;
let store: Store<ServicesState & ClientsState>;

const fakeService: ServiceItem = {
  service_uuid: faker.random.uuid(),
  name: faker.commerce.productName(),
  description: faker.lorem.sentence(),
  base_price: faker.commerce.price(),
  duration_minutes: faker.random.number(),
  category_name: faker.commerce.productMaterial(),
  category_uuid: faker.random.uuid(),
  is_enabled: true,
  photo_samples: []
};

describe('Pages: Add Appointment', () => {

  prepareSharedObjectsForTests();

  beforeEach(async () => TestUtils.beforeEachCompiler([
    AppointmentAddComponent
  ], [
    AppointmentService
  ], [
    HttpClientTestingModule,
    StoreModule.forFeature('service', servicesReducer),
    StoreModule.forFeature('clients', clientsReducer)
  ]).then(compiled => {
    fixture = compiled.fixture;
    instance = compiled.instance;

    store = fixture.debugElement.injector.get(Store);

    // subscribe to store
    instance.ionViewWillLoad();
  }));

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

  it('should search for clients', async(() => {
    const clients = clientsMock.slice(0, 3);
    store.dispatch(new SearchSuccessAction(clients));

    fixture.detectChanges();

    // expect menu show clients
    clients.forEach(client => {
      expect(fixture.nativeElement.textContent)
        .toContain(`${client.first_name} ${client.last_name}`);
    });

    const client = fixture.nativeElement.querySelector('.Appointment-customersListItem');
    expect(client)
      .toBeTruthy();

    client.click();

    fixture.detectChanges();

    // check value in input updated
    expect(client.textContent)
      .toContain(fixture.nativeElement.querySelector('[formcontrolname="client"] input').value);

    // check selected client property updated
    expect(client.textContent)
      .toContain(`${instance.selectedClient.first_name} ${instance.selectedClient.last_name}`);
  }));

  it('should receive selected service from store', async(() => {
    store.dispatch(new SelectServiceAction(fakeService));

    fixture.detectChanges();

    // check value in input updated
    expect(fakeService.name)
      .toEqual(fixture.nativeElement.querySelector('[formcontrolname="service"] input').value);

    // check selected service property updated
    expect(instance.selectedService.service_uuid)
      .toEqual(fakeService.service_uuid);
  }));

  it('should submit form', async(() => {
    store.dispatch(new SelectServiceAction(fakeService));

    fixture.detectChanges();

    const client = clientsMock[0];
    const nextWeek = moment().add(7, 'days');

    // add missed values
    instance.form.patchValue({
      client: `${client.first_name} ${client.last_name}`,
      date: nextWeek.format('YYYY-MM-DD'),
      time: nextWeek.format('HH:mm')
    });

    // transform to request data
    const data = {
      client_first_name: client.first_name,
      client_last_name: client.last_name,
      services: [{ service_uuid: fakeService.service_uuid }],
      datetime_start_at: nextWeek.format('YYYY-MM-DDTHH:mm:00Z')
    };

    const appointmentsService = fixture.debugElement.injector.get(AppointmentService);
    spyOn(appointmentsService, 'createAppointment');

    // enables submit
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[type="submit"]').click();

    expect(appointmentsService.createAppointment)
      .toHaveBeenCalledWith(data);
  }));
});
