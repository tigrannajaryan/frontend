import * as moment from 'moment';

import { async, ComponentFixture } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';

import { TestUtils } from '~/../test';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

import { AppointmentDateComponent, greenColor, neutralColor } from '~/appointment/appointment-date/appointment-date';
import { AppointmentDateOffer } from '~/home/home.models';

import { servicesReducer } from '~/appointment/appointment-services/services.reducer';
import { clientsReducer } from '~/appointment/appointment-add/clients.reducer';
import {
  appointmentDatesReducer,
  AppointmentDatesState,
  appointmentDatesStatePath,
  GetDatesSuccessAction
} from '~/appointment/appointment-date/appointment-dates.reducer';

const mockDates: AppointmentDateOffer[] = [
  {date: '2018-06-28', price: 10, is_fully_booked: true, is_working_day: false},
  {date: '2018-06-29', price: 100, is_fully_booked: false, is_working_day: true},
  {date: '2018-06-30', price: 190, is_fully_booked: false, is_working_day: false}
];

let fixture: ComponentFixture<AppointmentDateComponent>;
let instance: AppointmentDateComponent;
let store: Store<AppointmentDatesState>;

describe('Page: Appointment Date Select', () => {
  prepareSharedObjectsForTests();

  beforeEach(async(() => TestUtils.beforeEachCompiler([
    AppointmentDateComponent
  ], [], [
    StoreModule.forFeature('service', servicesReducer),
    StoreModule.forFeature('clients', clientsReducer),
    StoreModule.forFeature(appointmentDatesStatePath, appointmentDatesReducer)
  ]).then(compiled => {
    fixture = compiled.fixture;
    instance = compiled.instance;

    store = fixture.debugElement.injector.get(Store);
    store.dispatch(new GetDatesSuccessAction(mockDates));

    instance.ionViewWillLoad(); // subscribe to store

    fixture.detectChanges();
  })));

  it('should create the component', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

  it('should show days ordered by date ASC', async(() => {
    const [lowPriced, midPriced, highPriced] = Array.from(
      fixture.nativeElement.querySelectorAll('.DateCard')
    );

    // check for order, proper date format and price
    expect(lowPriced.textContent)
      .toContain(moment(mockDates[0].date).format('D MMM'));
    expect(lowPriced.textContent)
      .toContain(`$${mockDates[0].price}`);

    expect(midPriced.textContent)
      .toContain(`$${mockDates[1].price}`);
    expect(midPriced.textContent)
      .toContain(moment(mockDates[1].date).format('D MMM'));

    expect(highPriced.textContent)
      .toContain(`$${mockDates[2].price}`);
    expect(highPriced.textContent)
      .toContain(moment(mockDates[2].date).format('D MMM'));
  }));

  it('should show only low prices colored', async(() => {
    const [low, mid, high] = Array.from(
      fixture.nativeElement.querySelectorAll('.DateCard .DateCard-price')
    );

    expect(low.style.color)
      .toContain(greenColor);

    expect(mid.style.color)
      .toContain(neutralColor);
    expect(high.style.color)
      .toContain(neutralColor);
  }));

  it('should show ”Non-working” label on non-working day', async(() => {
    const nonWorkingDay = fixture.nativeElement.querySelector('.DateCard');

    expect(nonWorkingDay.textContent)
      .toContain('Non-working');
  }));

  it('should show ”Fully Booked” label on fully booked day', async(() => {
    const fullyBookedDay = fixture.nativeElement.querySelector('.DateCard');

    expect(fullyBookedDay.textContent)
      .toContain('Fully Booked');
  }));

  it('should throw an error when no service is selected', async(() => {
    let error;
    try {
      instance.ionViewDidEnter(); // request dates
    } catch (e) {
      error = e;
    }
    expect(error)
      .toBeTruthy();
  }));
});
