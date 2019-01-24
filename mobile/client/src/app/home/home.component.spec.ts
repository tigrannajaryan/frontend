import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '~/../test';

import { pastAppointmentsMock, upcomingAppointmentsMock } from '~/core/api/appointments.api.mock';
import { stylistsMock } from '~/core/api/stylists.service.mock';

import { HomeComponent } from './home.component';

let fixture: ComponentFixture<HomeComponent>;
let instance: HomeComponent;

describe('Pages: Home', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([HomeComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
        .then(async () => {
          await instance.ionViewWillEnter();
          spyOn(instance.slides, 'getActiveIndex').and.returnValue(0);
          fixture.detectChanges();
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should show Upcoming and Past tabs', () => {
    const tabs = fixture.nativeElement.querySelector('[data-test-id=tabs]');

    expect(tabs.textContent)
      .toContain('Upcoming');
    expect(tabs.textContent)
      .toContain('Past');
  });

  it('should show stylists only on Upcoming tab', () => {
    expect(instance.stylists)
      .toBeTruthy();
    expect(instance.slides.getActiveIndex())
      .toBe(0);

    const stylistsNode = fixture.nativeElement.querySelector('[data-test-id=stylists]');

    expect(stylistsNode.textContent)
      .toBeTruthy();
    expect(stylistsNode.textContent)
      .toContain('Your Stylists');
    expect(stylistsNode.textContent)
      .toContain('Details');

    const imageSources =
      Array.from(document.querySelectorAll('[data-test-id="stylists"] img'))
        .reduce((srcs, img) => srcs.concat([(img as any).src]), [])
        .join(', ');

    stylistsMock.forEach(stylist => {
      expect(imageSources)
        .toContain(stylist.profile_photo_url);
    });

    (instance.slides.getActiveIndex as jasmine.Spy).and.returnValue(1);
    fixture.detectChanges();

    expect(instance.slides.getActiveIndex())
      .toBe(1);
    expect(fixture.nativeElement.querySelector('[data-test-id=stylists]'))
      .toBeFalsy();
    expect(fixture.nativeElement.textContent)
      .not.toContain('Your Stylists');
    expect(fixture.nativeElement.textContent)
      .not.toContain('Details');
  });

  it('should show book btn on both tabs', async done => {
    expect(fixture.nativeElement.querySelector('[data-test-id=bookLink]'))
      .toBeTruthy();

    (instance.slides.getActiveIndex as jasmine.Spy).and.returnValue(1);
    await (instance as any).loadTabData(1);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-test-id=bookLink]'))
      .toBeTruthy();

    done();
  });

  it('should show upcoming appointments', () => {
    upcomingAppointmentsMock.forEach(appointment => {
      expect(fixture.nativeElement.textContent)
        .toContain(appointment.services.map(s => s.service_name).join(', '));
    });
  });

  it('should show no appointments text', () => {
    instance.tabs[0].appointments = [];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain('You have no upcoming appointments');
  });

  it('should show past appointments', async done => {
    (instance.slides.getActiveIndex as jasmine.Spy).and.returnValue(1);
    await (instance as any).loadTabData(1);
    fixture.detectChanges();

    pastAppointmentsMock.forEach(appointment => {
      expect(fixture.nativeElement.textContent)
        .toContain(appointment.services.map(s => s.service_name).join(', '));
    });

    done();
  });
});
