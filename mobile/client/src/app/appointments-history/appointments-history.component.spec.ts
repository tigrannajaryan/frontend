import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '~/../test';

import { AppointmentsApiMock } from '~/core/api/appointments.api.mock';
import { AppointmentsApi } from '~/core/api/appointments.api';
import { AppointmentsHistoryComponent } from '~/appointments-history/appointments-history.component';

let fixture: ComponentFixture<AppointmentsHistoryComponent>;
let instance: AppointmentsHistoryComponent;


describe('Pages: History', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([AppointmentsHistoryComponent], [AppointmentsApiMock])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have history visits', done => {
    const appointmentsApi = fixture.debugElement.injector.get(AppointmentsApi);
    const appointmentsApiMock = fixture.debugElement.injector.get(AppointmentsApiMock);

    spyOn(appointmentsApi, 'getHistory').and.returnValue(
      appointmentsApiMock.getHistory(1)
    );

    instance.onRefresh(false);

    setTimeout(() => {
      fixture.detectChanges();

      const historyAppointment = fixture.nativeElement.querySelector('[data-test-id=historyAppointment]');
      expect(historyAppointment).toBeDefined();

      done();
    });
  });

  it('shouldn’t have history visits', done => {
    const appointmentsApi = fixture.debugElement.injector.get(AppointmentsApi);
    const appointmentsApiMock = fixture.debugElement.injector.get(AppointmentsApiMock);

    spyOn(appointmentsApi, 'getHistory').and.returnValue(
      appointmentsApiMock.getHistory(0)
    );

    instance.onRefresh(false);

    setTimeout(() => {
      fixture.detectChanges();

      const historyAppointment = fixture.nativeElement.querySelector('[data-test-id=historyAppointment]');
      expect(historyAppointment).toBeNull();

      done();
    });
  });

  it('refresher should works properly', done => {
    const appointmentsApi = fixture.debugElement.injector.get(AppointmentsApi);
    const appointmentsApiMock = fixture.debugElement.injector.get(AppointmentsApiMock);
    const getHistorySpy = spyOn(appointmentsApi, 'getHistory');
    // we have one upcoming appointment before refresh
    getHistorySpy.and.returnValue(appointmentsApiMock.getHistory(1));


    instance.onRefresh(false);

    setTimeout(() => {
      fixture.detectChanges();

      let historyAppointment = fixture.nativeElement.querySelectorAll('[data-test-id=historyAppointment]');
      expect(historyAppointment.length).toBe(1);

      // now we make a refresh and get 5 upcoming appointments
      getHistorySpy.and.returnValue(appointmentsApiMock.getHistory(5));
      instance.onRefresh(false);

      setTimeout(() => {
        fixture.detectChanges();

        historyAppointment = fixture.nativeElement.querySelectorAll('[data-test-id=historyAppointment]');
        expect(historyAppointment.length).toBe(5);

        done();
      });
    });
  });
});
