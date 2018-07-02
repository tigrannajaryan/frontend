import { async, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TestUtils } from '../../test';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { TodayService } from '~/today/today.service';
import { UpcomingComponent } from '~/upcoming/upcoming.component';

let fixture: ComponentFixture<UpcomingComponent>;
let instance: UpcomingComponent;

describe('Pages: UpcomingComponent', () => {

  prepareSharedObjectsForTests();

  // TestBed.createComponent(ProfileComponent) inside
  // see https://angular.io/guide/testing#component-class-testing for more info
  beforeEach(async(() => TestUtils.beforeEachCompiler([
    UpcomingComponent
  ], [TodayService], [HttpClientTestingModule]).then(compiled => {
    fixture = compiled.fixture; // https://angular.io/api/core/testing/ComponentFixture
    instance = compiled.instance;
  })));

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

  it('should call the API on init', async(async () => {
    // update html
    fixture.detectChanges();

    // get injected Stylist API
    const todayService = fixture.debugElement.injector.get(TodayService);

    spyOn(todayService, 'getAppointments');

    // loads data
    await instance.init();

    expect(todayService.getAppointments)
      .toHaveBeenCalledTimes(1);
  }));

  it('should show total appointments counter', async(async () => {
    // update html
    fixture.detectChanges();

    await instance.init();

    expect(fixture.nativeElement.querySelector('page-upcoming .bb-text-up-info'))
      .toBeTruthy();
  }));
});
