import { async, ComponentFixture } from '@angular/core/testing';
import {
  AlertController,
  LoadingController,
  NavController
} from 'ionic-angular';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { TestUtils } from '../../test';

import { PageNames } from '~/core/page-names';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { ProfileComponent } from './profile';
import { ProfileInfoComponent } from './profile-info/profile-info';

import { profileSummaryMock as mock } from '~/core/stylist-service/stylist-service-mock';
import { WEEKDAY_FULL_NAMES, WeekdayIso } from '~/shared/weekday';

let fixture: ComponentFixture<ProfileComponent>;
let instance: ProfileComponent;

describe('Pages: Profile / Settings', () => {

  prepareSharedObjectsForTests();

  // TestBed.createComponent(ProfileComponent) inside
  // see https://angular.io/guide/testing#component-class-testing for more info
  beforeEach(async(() => TestUtils.beforeEachCompiler([
    ProfileComponent,
    ProfileInfoComponent
  ], [DatePipe], [HttpClientTestingModule]).then(compiled => {
    fixture = compiled.fixture; // https://angular.io/api/core/testing/ComponentFixture
    instance = compiled.instance;
  })));

  it('should create the page', async(() => {
    // this is a matcher from Jasmine, check Jasmine docs for more
    expect(instance)
      .toBeTruthy();
  }));

  it('should call the API', async(async () => {
    // get injected Stylist API
    const stylistService = fixture.debugElement.injector.get(StylistServiceProvider);

    spyOn(stylistService, 'getStylistSummary');

    // loads data
    await instance.loadStylistSummary();

    expect(stylistService.getStylistSummary)
      .toHaveBeenCalledTimes(1);
  }));

  it('should show stylist info: name and salon address', async(async () => {
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
  }));

  it('should have edit page button', async(() => {
    // update html
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(`[ng-reflect-made-link^="RegisterSalonComponent"]`))
      .toBeTruthy();
  }));

  it('should show all services count', async(async () => {
    await instance.loadStylistSummary();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain(mock.services_count);
  }));

  it('should show services data', async(async () => {
    await instance.loadStylistSummary();
    fixture.detectChanges();

    mock.services.forEach(service => {
      expect(fixture.nativeElement.textContent)
        .toContain(service.name);

      expect(fixture.nativeElement.textContent)
        .toContain(`$${service.base_price}`);
    });
  }));

  it('should have services edit button', async(() => {
    // update html
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(`[ng-reflect-made-link^="ServicesListComponent"]`))
      .toBeTruthy();
  }));

  it('should show appointments count summary', async(async () => {
    const total = mock.total_week_appointments_count;
    const today = mock.worktime.find(day => day.weekday_iso === WeekdayIso.Fri); // TGI Friday
    const todayBooked = today.booked_appointments_count;

    await instance.loadStylistSummary();
    instance.today = today; // set today manually

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain(`${todayBooked} ${todayBooked === 1 ? 'visit' : 'visits'} today`);

    expect(fixture.nativeElement.textContent)
      .toContain(`${total} ${total === 1 ? 'visit' : 'visits'} this week`);
  }));

  it('should show working hours data', async(async () => {
    await instance.loadStylistSummary();
    fixture.detectChanges();

    mock.worktime
      .filter(worktime => worktime.is_available)
      .forEach(worktime => {
        expect(fixture.nativeElement.textContent)
          .toContain(WEEKDAY_FULL_NAMES[worktime.weekday_iso]);

        expect(fixture.nativeElement.textContent)
          .toContain(`${instance.formatTime(worktime.work_start_at)} – ${instance.formatTime(worktime.work_end_at)}`);

        expect(fixture.nativeElement.querySelector('made-table.Profile-worktime').textContent)
          .toContain(worktime.booked_appointments_count);
      });
  }));

  it('should not show unavailable working hours data', async(async () => {
    // because the API returns all days

    await instance.loadStylistSummary();
    fixture.detectChanges();

    mock.worktime
      .filter(worktime => !worktime.is_available)
      .forEach(worktime => {
        expect(fixture.nativeElement.textContent)
          .not.toContain(WEEKDAY_FULL_NAMES[worktime.weekday_iso]);
      });
  }));

  it('should show working hours edit button', async(() => {
    // update html
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(`[ng-reflect-made-link^="Worktime"]`))
      .toBeTruthy();
  }));

  it('should create loader when data is loading', async(async () => {
    const loadingControl = fixture.debugElement.injector.get(LoadingController);

    await instance.loadStylistSummary();

    expect(loadingControl.create)
      .toHaveBeenCalledTimes(1);
  }));

  it('should create alert when data failed to load', async(async () => {
    const alertControl = fixture.debugElement.injector.get(AlertController);

    const stylistService = fixture.debugElement.injector.get(StylistServiceProvider);
    spyOn(stylistService, 'getStylistSummary').and.returnValue(() => {
      throw new Error();
    });

    await instance.loadStylistSummary();

    expect(alertControl.create)
      .toHaveBeenCalledTimes(1);
  }));

  it('should have proper header', async(() => {
    const navControl = fixture.debugElement.injector.get(NavController);

    // Profile is navigated from Today, set pages
    navControl.setPages([
      { page: PageNames.Today },
      { page: PageNames.Profile }
    ]);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('ion-navbar [navPop] ion-icon[name="ios-arrow-round-back-outline"]'))
      .toBeTruthy();

    expect(fixture.nativeElement.querySelector('ion-navbar ion-icon[name="ios-home-outline"]'))
      .toBeTruthy();

    expect(fixture.nativeElement.querySelector('ion-navbar ion-icon[name="ios-more"]'))
      .toBeTruthy();
  }));
});
