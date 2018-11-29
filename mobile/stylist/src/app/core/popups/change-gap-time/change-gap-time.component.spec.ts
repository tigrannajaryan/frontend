import { async, ComponentFixture } from '@angular/core/testing';
import { ViewController } from 'ionic-angular';
import { of } from 'rxjs/observable/of';

import { TestUtils } from '../../../../test';
import { ChangeGapTimeComponent } from './change-gap-time.component';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { StylistServiceProvider } from '~/core/api/stylist.service';
import { ViewControllerMock } from '~/shared/view-controller-mock';
import { StylistServicesDataStore } from '~/services/services-list/services.data';
import { categoryMock, StylistServiceMock } from '~/core/api/stylist.service.mock';

let fixture: ComponentFixture<ChangeGapTimeComponent>;
let instance: ChangeGapTimeComponent;

describe('Pages: ChangeGapTimeComponent', () => {

  prepareSharedObjectsForTests();

  beforeEach(() => TestUtils.beforeEachCompiler(
    [ChangeGapTimeComponent],
    [
      StylistServicesDataStore,
      StylistServiceMock,
      { provide: ViewController, useClass: ViewControllerMock }
      ])
    .then(async (compiled) => {
      fixture = compiled.fixture;
      instance = compiled.instance;

      let stylistService = fixture.debugElement.injector.get(StylistServiceProvider);
      spyOn(stylistService, 'getStylistServices').and.returnValue(
        of({response: {
            categories: [categoryMock],
            service_time_gap_minutes: 60
          }})
      );

      const { response } = await stylistService.getStylistServices().get();
      instance.stylistServicesRes = response;

      instance.ngAfterViewInit();
      fixture.detectChanges();
    }));

  it('should create the page',() => {
    expect(instance)
      .toBeTruthy();
  });

  it('should load services data',() => {
    const changeGapTime = fixture.nativeElement.querySelector('[data-test-id=changeGapTime]');
    expect(changeGapTime).toBeDefined();
    expect(instance.stylistServicesRes).toBeDefined();
  });

  it('should show slider with correct gapTime',() => {
    const range = fixture.nativeElement.querySelector('[data-test-id=changeGapTime-range]');
    expect(range).toBeDefined();

    const percentage = fixture.nativeElement.querySelector('[data-test-id=changeGapTime-percentage]');
    expect(percentage.innerHTML).toContain(instance.stylistServicesRes.service_time_gap_minutes);
  });

  it('should have correct title text',() => {
    const h1 = fixture.nativeElement.querySelector('[data-test-id=changeGapTime-h1]');
    expect(h1.innerHTML).toBe('How many minutes between client bookings?');
  });

  it('should save changed gapTime and close the modal',() => {
    instance.stylistServicesRes.service_time_gap_minutes = 30;
    fixture.detectChanges();
    const percentage = fixture.nativeElement.querySelector('[data-test-id=changeGapTime-percentage]');
    expect(percentage.innerHTML).toContain(instance.stylistServicesRes.service_time_gap_minutes);

    let viewController = fixture.debugElement.injector.get(ViewController);
    spyOn(viewController, 'dismiss');

    let stylistService = fixture.debugElement.injector.get(StylistServiceProvider);
    let stylistServiceMock = fixture.debugElement.injector.get(StylistServiceMock);
    spyOn(stylistService, 'setStylistServices').and.returnValue(
      stylistServiceMock.setStylistServices({
        services: stylistService.getFlatServiceList(instance.stylistServicesRes.categories),
        service_time_gap_minutes: instance.stylistServicesRes.service_time_gap_minutes
      })
    );

    instance.saveTimeGap();

    expect(viewController.dismiss).toHaveBeenCalled();
    expect(stylistService.setStylistServices).toHaveBeenCalled();
  });

  it('should close the modal without saving',() => {
    let viewController = fixture.debugElement.injector.get(ViewController);
    spyOn(viewController, 'dismiss');

    let stylistService = fixture.debugElement.injector.get(StylistServiceProvider);
    let stylistServiceMock = fixture.debugElement.injector.get(StylistServiceMock);
    spyOn(stylistService, 'setStylistServices').and.returnValue(
      stylistServiceMock.setStylistServices({
        services: stylistService.getFlatServiceList(instance.stylistServicesRes.categories),
        service_time_gap_minutes: instance.stylistServicesRes.service_time_gap_minutes
      })
    );

    instance.closePopup();

    expect(viewController.dismiss).toHaveBeenCalled();
    expect(stylistService.setStylistServices).not.toHaveBeenCalled();
  });
});
