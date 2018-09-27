import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '~/../test';

import { HomePageComponent } from '~/home-page/home-page.component';
import { AppointmentsApiMock } from '~/core/api/appointments.api.mock';
import { AppointmentsApi } from '~/core/api/appointments.api';

let fixture: ComponentFixture<HomePageComponent>;
let instance: HomePageComponent;


describe('Pages: Home', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([HomePageComponent])
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

  it('should have upcoming visits', done => {
    const appointmentsApi = fixture.debugElement.injector.get(AppointmentsApi);
    const appointmentsApiMock = fixture.debugElement.injector.get(AppointmentsApiMock);

    spyOn(appointmentsApi, 'getHome').and.returnValue(
      appointmentsApiMock.getHome(1, 0)
    );

    instance.onRefresh(false);

    setTimeout(() => {
      fixture.detectChanges();

      const upcomingAppointment = fixture.nativeElement.querySelector('[data-test-id=upcomingAppointment]');
      expect(upcomingAppointment).toBeDefined();

      done();
    });
  });

  it('shouldn’t have upcoming visits', done => {
    const appointmentsApi = fixture.debugElement.injector.get(AppointmentsApi);
    const appointmentsApiMock = fixture.debugElement.injector.get(AppointmentsApiMock);

    spyOn(appointmentsApi, 'getHome').and.returnValue(
      appointmentsApiMock.getHome(0, 1)
    );

    instance.onRefresh(false);

    setTimeout(() => {
      fixture.detectChanges();

      const upcomingAppointment = fixture.nativeElement.querySelector('[data-test-id=upcomingAppointment]');
      expect(upcomingAppointment).toBeNull();

      done();
    });
  });

  it('should have last visit', done => {
    const appointmentsApi = fixture.debugElement.injector.get(AppointmentsApi);
    const appointmentsApiMock = fixture.debugElement.injector.get(AppointmentsApiMock);

    spyOn(appointmentsApi, 'getHome').and.returnValue(
      appointmentsApiMock.getHome(0, 1)
    );

    instance.onRefresh(false);

    setTimeout(() => {
      fixture.detectChanges();

      const lastVisitAppointment = fixture.nativeElement.querySelector('[data-test-id=lastVisitAppointment]');
      expect(lastVisitAppointment).toBeDefined();

      done();
    });
  });

  it('shouldn’t have last visit', done => {
    const appointmentsApi = fixture.debugElement.injector.get(AppointmentsApi);
    const appointmentsApiMock = fixture.debugElement.injector.get(AppointmentsApiMock);

    spyOn(appointmentsApi, 'getHome').and.returnValue(
      appointmentsApiMock.getHome(1, 0)
    );

    instance.onRefresh(false);

    setTimeout(() => {
      fixture.detectChanges();

      const lastVisitAppointment = fixture.nativeElement.querySelector('[data-test-id=lastVisitAppointment]');
      expect(lastVisitAppointment).toBeNull();

      done();
    });
  });

  it('shouldn’t have visits at all', done => {
    const appointmentsApi = fixture.debugElement.injector.get(AppointmentsApi);
    const appointmentsApiMock = fixture.debugElement.injector.get(AppointmentsApiMock);

    spyOn(appointmentsApi, 'getHome').and.returnValue(
      appointmentsApiMock.getHome()
    );

    instance.onRefresh(false);

      setTimeout(() => {
        fixture.detectChanges();

        const upcomingAppointment = fixture.nativeElement.querySelector('[data-test-id=upcomingAppointment]');
        expect(upcomingAppointment).toBeNull();
        const lastVisitAppointment = fixture.nativeElement.querySelector('[data-test-id=lastVisitAppointment]');
        expect(lastVisitAppointment).toBeNull();

        done();
      });
  });

  it('should have booking link', done => {
    const appointmentsApi = fixture.debugElement.injector.get(AppointmentsApi);
    const appointmentsApiMock = fixture.debugElement.injector.get(AppointmentsApiMock);

    spyOn(appointmentsApi, 'getHome').and.returnValue(
      appointmentsApiMock.getHome()
    );

    instance.onRefresh(false);

    setTimeout(() => {
      fixture.detectChanges();

      const bookLink = fixture.nativeElement.querySelector('[data-test-id=bookLink]');
      expect(bookLink).toBeDefined();

      done();
    });
  });

  it('refresher should works properly', done => {
    const appointmentsApi = fixture.debugElement.injector.get(AppointmentsApi);
    const appointmentsApiMock = fixture.debugElement.injector.get(AppointmentsApiMock);
    const getHomeSpy = spyOn(appointmentsApi, 'getHome');
    // we have one upcoming appointment before refresh
    getHomeSpy.and.returnValue(appointmentsApiMock.getHome(1, 0));


    instance.onRefresh(false);

    setTimeout(() => {
      fixture.detectChanges();

      let upcomingAppointment = fixture.nativeElement.querySelectorAll('[data-test-id=upcomingAppointment]');
      expect(upcomingAppointment.length).toBe(1);

      // now we make a refresh and get 5 upcoming appointments
      getHomeSpy.and.returnValue(appointmentsApiMock.getHome(5, 0));
      instance.onRefresh(false);

      setTimeout(() => {
        fixture.detectChanges();

        upcomingAppointment = fixture.nativeElement.querySelectorAll('[data-test-id=upcomingAppointment]');
        expect(upcomingAppointment.length).toBe(5);

        done();
      });
    });
  });
});
