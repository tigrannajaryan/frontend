import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavParams, ViewController } from 'ionic-angular';
import { ViewControllerMock } from 'ionic-mocks';
import * as moment from 'moment';

import { ISODate, isoDateFormat } from '~/shared/api/base.models';

import { CalendarPickerComponent, CalendarPickerParams, Day, DefaultWeekdays } from './calendar-picker.component';

let fixture: ComponentFixture<CalendarPickerComponent>;
let instance: CalendarPickerComponent;
let params: CalendarPickerParams;

describe('CalendarPickerComponent', () => {
  beforeEach(async(() =>
    TestBed
      .configureTestingModule({
        declarations: [CalendarPickerComponent],
        providers: [
          NavParams,
          { provide: ViewController, useFactory: () => ViewControllerMock.instance() }
        ],
        imports: [
          // Load all Ionic’s deps:
          IonicModule.forRoot(this)
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CalendarPickerComponent);
        instance = fixture.componentInstance;
      })
      .then(() => {
        const defaultWeekdays = [
          { isoWeekday: 1, isFaded: true },
          { isoWeekday: 2 },
          { isoWeekday: 3 },
          { isoWeekday: 4 },
          { isoWeekday: 5, isFaded: true },
          { isoWeekday: 6 },
          { isoWeekday: 7 }
        ];
        const navParams = fixture.debugElement.injector.get(NavParams);
        params = {
          defaultWeekdays: defaultWeekdays as DefaultWeekdays,
          selectedIsoDate: moment().add(1, 'day').format(isoDateFormat),
          onDaysLoaded: jasmine.createSpy('onDaysLoaded'),
          onDateSelected: jasmine.createSpy('onDateSelected')
        };
        navParams.data = { params };
        instance.ngOnInit();
      })
  ));

  it('should create the component', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have data', () => {
    const months = (instance as any).months;

    expect(params.onDaysLoaded)
      .toHaveBeenCalled();
    expect(months)
      .toBeTruthy();
    expect(months.length)
      .toBe(13);
  });

  it('should select date', () => {
    const isoToday = moment().format(isoDateFormat);

    instance.onDateSelect(isoToday);

    expect(params.onDateSelected)
      .toHaveBeenCalledWith(isoToday);
  });

  it('should get all days of months', () => {
    const days: Array<[ISODate, Day]> = [
      [ '2018-01-01', { day: 1, isoWeekday: 1 } ],
      [ '2018-01-02', { day: 2, isoWeekday: 2 } ]
    ];
    const months = [
      { year: 0, month: 0, days: new Map([days[0]]) },
      { year: 0, month: 0, days: new Map([days[1]]) }
    ];
    const allDays = Array.from(
      (instance as any).getDaysOfMonths(months).entries()
    );

    expect(allDays)
      .toEqual(days);
  });
});
