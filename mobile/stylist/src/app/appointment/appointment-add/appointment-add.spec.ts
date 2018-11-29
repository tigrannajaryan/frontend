import * as faker from 'faker';
import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { async, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Store, StoreModule } from '@ngrx/store';

import { TestUtils } from '~/../test';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { HomeService as AppointmentService } from '~/core/api/home.service';
import { ServiceItem } from '~/shared/api/stylist-app.models';
import { SelectServiceAction, servicesReducer, ServicesState } from '~/appointment/appointment-services/services.reducer';
import { WorktimeApi } from '~/core/api/worktime.api';
import { AppointmentAddComponent } from './appointment-add';

const nextWeek = moment().add(7, 'days');

const client = {
  first_name: 'Hello',
  last_name: 'World',
  phone: '+1234567890'
};

const forced = false;

let fixture: ComponentFixture<AppointmentAddComponent>;
let instance: AppointmentAddComponent;
let store: Store<ServicesState>;

const fakeService: ServiceItem = {
  uuid: faker.random.uuid(),
  name: faker.commerce.productName(),
  description: faker.lorem.sentence(),
  base_price: parseInt(faker.commerce.price(), 10),
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
    // no providers
  ], [
    HttpClientTestingModule,
    StoreModule.forFeature('service', servicesReducer)
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

  it('should receive selected service from store', async(() => {
    store.dispatch(new SelectServiceAction(fakeService));

    fixture.detectChanges();

    // check value in input updated
    expect(fixture.nativeElement.querySelector('[id="selectedService"]').textContent)
      .toContain(fakeService.name);

    // check selected service property updated
    expect(instance.selectedService.uuid)
      .toEqual(fakeService.uuid);
  }));

  it('should submit form', async(() => {
    store.dispatch(new SelectServiceAction(fakeService));

    fixture.detectChanges();

    // add missed values
    instance.form.patchValue({
      client: `${client.first_name} ${client.last_name}`,
      phone: client.phone,
      date: nextWeek.format('YYYY-MM-DD'),
      time: nextWeek.format('HH:mm')
    });

    // transform to request data
    const data = {
      client_phone: client.phone,
      client_first_name: client.first_name,
      client_last_name: client.last_name,
      services: [{ service_uuid: fakeService.uuid }],
      datetime_start_at: nextWeek.format('YYYY-MM-DDTHH:mm:00')
    };

    const appointmentsService = fixture.debugElement.injector.get(AppointmentService);
    spyOn(appointmentsService, 'createAppointment').and.returnValue(Observable.of(true));

    // enables submit
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[id="submitBtn"]').click();

    const options = { hideGenericAlertOnFieldAndNonFieldErrors: true };
    expect(appointmentsService.createAppointment)
      .toHaveBeenCalledWith(data, forced, options);
  }));

  it('should submit empty data for blocked slot', async(() => {
    store.dispatch(new SelectServiceAction(fakeService));

    fixture.detectChanges();

    instance.isBlockedSlot.patchValue(true); // indicates it’s just a blocked slot
    instance.form.patchValue({ // try to set up data for it, should be omitted in request
      client: `${client.first_name} ${client.last_name}`,
      phone: client.phone,
      date: nextWeek.format('YYYY-MM-DD'),
      time: nextWeek.format('HH:mm')
    });

    // transform to request data
    const data = {
      client_first_name: '',
      client_last_name: '',
      client_phone: '',
      services: [],
      datetime_start_at: nextWeek.format('YYYY-MM-DDTHH:mm:00')
    };

    const appointmentsService = fixture.debugElement.injector.get(AppointmentService);
    spyOn(appointmentsService, 'createAppointment').and.returnValue(Observable.of(true));

    // enables submit
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[id="submitBtn"]').click();

    const options = { hideGenericAlertOnFieldAndNonFieldErrors: true };
    expect(appointmentsService.createAppointment)
      .toHaveBeenCalledWith(data, forced, options);
  }));

  it('should submit blocked day', () => {
    instance.isBlockedFullDay.patchValue(true); // indicates it’s just a blocked slot
    instance.form.patchValue({ // try to set up data for it, should be omitted in request
      client: `${client.first_name} ${client.last_name}`,
      phone: client.phone,
      date: nextWeek.format('YYYY-MM-DD'),
      time: nextWeek.format('HH:mm')
    });

    const worktimeService = fixture.debugElement.injector.get(WorktimeApi);
    spyOn(worktimeService, 'setWorkdayAvailable').and.returnValue(
      Observable.of({ is_available: false })
    );

    // enables submit
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[id="submitBtn"]').click();

    expect(worktimeService.setWorkdayAvailable)
      .toHaveBeenCalledWith(nextWeek.format('YYYY-MM-DD'), false);
  });
});
