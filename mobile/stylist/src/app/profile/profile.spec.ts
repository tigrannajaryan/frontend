import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertController, IonicModule, LoadingController, NavController, NavParams, ViewController } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { NavMock } from '~/services/services.component.spec';
import { ViewControllerMock } from '~/shared/view-controller-mock';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { TestUtils } from '../../test';

import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { ProfileComponent, WEEKDAY_FULL_NAMES } from './profile';
import { ProfileInfoComponent } from './profile-info/profile-info';

import { profileSummaryMock as mock } from '~/core/stylist-service/stylist-service-mock';
import { convertMinsToHrsMins, FormatType } from '~/shared/time';

let fixture: ComponentFixture<ProfileComponent>;
let instance: ProfileComponent;

describe('Pages: Profile / Settings', () => {

  prepareSharedObjectsForTests();

  // TestBed.createComponent(ProfileComponent) inside
  // see https://angular.io/guide/testing#component-class-testing for more info
  beforeEach(async(() => TestUtils.beforeEachCompiler([
    ProfileComponent,
    ProfileInfoComponent
  ], [DatePipe], [HttpClientModule]).then(compiled => {
    fixture = compiled.fixture; // https://angular.io/api/core/testing/ComponentFixture
    instance = compiled.instance;
  })));

  it('should create the page', async(() => {
    // this is a matcher from Jasmine, check Jasmine docs for more
    expect(instance)
      .toBeTruthy();
  }));

  it('should call the API', async () => {
    // get injected Stylist API
    const stylistService = fixture.debugElement.injector.get(StylistServiceProvider);

    spyOn(stylistService, 'getStylistSummary');

    // loads data
    await instance.loadStylistSummary();

    expect(stylistService.getStylistSummary)
      .toHaveBeenCalledTimes(1);
  });

  it('should show stylist info: name and salon address', async () => {
    await instance.loadStylistSummary();

    // update html
    fixture.detectChanges();

    // search page’s text content
    expect(fixture.nativeElement.textContent)
      .toContain(mock.profile.first_name);

    expect(fixture.nativeElement.textContent)
      .toContain(mock.profile.last_name);

    expect(fixture.nativeElement.textContent)
      .toContain(mock.profile.salon_address);
  });

  it('should have edit page button', async () => {
    expect(fixture.nativeElement.querySelector('[madeLink][to="RegisterSalon"]'))
      .toBeTruthy();
  });

  it('should show all services count', async () => {
    await instance.loadStylistSummary();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain(mock.services_count);
  });

  it('should show services data', async () => {
    await instance.loadStylistSummary();
    fixture.detectChanges();

    mock.services.forEach(service => {
      expect(fixture.nativeElement.textContent)
        .toContain(service.name);

      expect(fixture.nativeElement.textContent)
        .toContain(convertMinsToHrsMins(service.duration_minutes, FormatType.ShortForm));

      expect(fixture.nativeElement.textContent)
        .toContain(`$${service.base_price}`);
    });
  });

  it('should have services edit button', async () => {
    expect(fixture.nativeElement.querySelector('[madeLink][to="RegisterServicesItem"]'))
      .toBeTruthy();
  });

  it('should show booked time summary for this week', async () => {
    const hours = Math.floor(mock.total_week_booked_minutes / 60);
    const minutes = mock.total_week_booked_minutes % 60;

    await instance.loadStylistSummary();
    fixture.detectChanges();

    if (hours > 0) {
      expect(fixture.nativeElement.textContent)
        .toContain(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    }

    if (minutes > 0) {
      expect(fixture.nativeElement.textContent)
        .toContain(`${minutes} minutes`);
    }
  });

  it('should show working hours data', async () => {
    await instance.loadStylistSummary();
    fixture.detectChanges();

    mock.worktime
      .filter(worktime => worktime.is_available)
      .forEach(worktime => {
        expect(fixture.nativeElement.textContent)
          .toContain(WEEKDAY_FULL_NAMES[worktime.weekday_iso]);

        expect(fixture.nativeElement.textContent)
          .toContain(`${instance.formatTime(worktime.work_start_at)} – ${instance.formatTime(worktime.work_end_at)}`);

        expect(fixture.nativeElement.textContent)
          .toContain(convertMinsToHrsMins(worktime.booked_time_minutes, FormatType.ShortForm));
      });
  });

  it('should not show unavailable working hours data', async () => {
    // because the API returns all days

    await instance.loadStylistSummary();
    fixture.detectChanges();

    mock.worktime
      .filter(worktime => !worktime.is_available)
      .forEach(worktime => {
        expect(fixture.nativeElement.textContent)
          .not.toContain(WEEKDAY_FULL_NAMES[worktime.weekday_iso]);
      });
  });

  it('should show working hours edit button', async () => {
    expect(fixture.nativeElement.querySelector('[madeLink][to="Worktime"]'))
      .toBeTruthy();
  });

  it('should create loader when data is loading', async () => {
    const loadingControl = fixture.debugElement.injector.get(LoadingController);

    await instance.loadStylistSummary();

    expect(loadingControl.create)
      .toHaveBeenCalledTimes(1);
  });

  it('should create alert when data failed to load', async () => {
    const alertControl = fixture.debugElement.injector.get(AlertController);

    const stylistService = fixture.debugElement.injector.get(StylistServiceProvider);
    spyOn(stylistService, 'getStylistSummary').and.returnValue(() => {
      throw new Error();
    });

    await instance.loadStylistSummary();

    expect(alertControl.create)
      .toHaveBeenCalledTimes(1);
  });
});
