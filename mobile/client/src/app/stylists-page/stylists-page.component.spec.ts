import * as faker from 'faker';

import { of } from 'rxjs/observable/of';
import { Platform } from 'ionic-angular';
import { async, ComponentFixture } from '@angular/core/testing';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AppAvailability } from '@ionic-native/app-availability';

import { TestUtils } from '~/../test';

import { StylistsEffects } from '~/core/effects/stylists.effects';
import { preferenceMock, stylistsMock } from '~/core/api/stylists-service.mock';
import { StylistsService } from '~/core/api/stylists-service';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { StylistsPageComponent } from './stylists-page.component';

import { openInstagram } from '~/shared/utils/open-external-app';

// Additional mocks
const providers = [
  {
    provide: InAppBrowser,
    useClass: class InAppBrowserMock {
      create = jasmine.createSpy('create').and.returnValue(
        jasmine.createSpyObj('instance', { show: Promise.resolve() })
      );
    }
  },
  {
    provide: AppAvailability,
    useClass: class AppAvailabilityMock {
      check = jasmine.createSpy('check').and.returnValue(Promise.resolve(true));
    }
  }
];

// Monkey patch SEARCHING_DELAY to 0 to avoid slowing down the tests:
StylistsEffects.SEARCHING_DELAY = 0;

const emptyStylistsResponseMock = {
  response: {
    stylists: []
  }
};

let fixture: ComponentFixture<StylistsPageComponent>;
let instance: StylistsPageComponent;

describe('Pages: Stylists Search', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([StylistsPageComponent], providers)
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
        .then(() => {
          // Current spec setup:
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should show default stylists list', done => {
    instance.ionViewWillEnter();

    // Skip loading:
    setTimeout(() => {
      fixture.detectChanges();

      const textContent = fixture.nativeElement.textContent;

      stylistsMock.forEach(stylist => {
        expect(textContent)
          .toContain(`${stylist.first_name} ${stylist.last_name}`);
        expect(textContent)
          .toContain(stylist.salon_name);
        expect(textContent)
          .toContain(stylist.salon_address);
        expect(textContent)
          .toContain(
            `${stylist.phone.slice(0, 2)} ${stylist.phone.slice(2, 5)} ${stylist.phone.slice(5, 8)} ${stylist.phone.slice(8, 11)}`
          );
        expect(textContent)
          .toContain(stylist.instagram_url);
        expect(textContent)
          .toContain(`Add ${stylist.first_name}!`);
      });

      done();
    });
  });

  it('should show ”no stylists in your area yet”', done => {
    const stylistsService = fixture.debugElement.injector.get(StylistsService);
    spyOn(stylistsService, 'search').and.returnValue(
      of(emptyStylistsResponseMock)
    );

    instance.ionViewWillEnter();

    // Skip loading:
    setTimeout(() => {
      fixture.detectChanges();

      const textContent = fixture.nativeElement.textContent;
      expect(textContent)
        .toContain("I'm sorry there are no stylists in your area yet. But check back often we're adding new stylists every day!");

      done();
    });
  });

  it('should show ”No stylists found”', done => {
    const stylistsService = fixture.debugElement.injector.get(StylistsService);
    spyOn(stylistsService, 'search').and.returnValue(
      of(emptyStylistsResponseMock)
    );

    instance.ionViewWillEnter();
    instance.query.patchValue(faker.lorem.word());

    // Skip loading:
    setTimeout(() => {
      fixture.detectChanges();

      const textContent = fixture.nativeElement.textContent;
      expect(textContent)
        .toContain('No stylists found');

      done();
    });
  });

  it('should set preferred stylist', done => {
    const preferredStylistsData = fixture.debugElement.injector.get(PreferredStylistsData);
    const stylistsService = fixture.debugElement.injector.get(StylistsService);

    spyOn(stylistsService, 'setPreferredStylist').and.returnValue(
      of({ response: preferenceMock })
    );

    instance.ionViewWillEnter();

    // Skip loading:
    setTimeout(async () => {
      fixture.detectChanges();

      // Click on ”Add” btn of the first stylist:
      fixture.nativeElement.querySelector('[data-test-id=addStylist]').click();
      await preferredStylistsData.get();

      expect(stylistsService.setPreferredStylist)
        .toHaveBeenCalledWith(stylistsMock[0].uuid);

      done();
    });
  });

  it('should open instagram app', done => {
    const appAvailability = fixture.debugElement.injector.get(AppAvailability);
    const browser = fixture.debugElement.injector.get(InAppBrowser);
    const platform = fixture.debugElement.injector.get(Platform);

    const instagram = stylistsMock[0].instagram_url;

    openInstagram(instagram);

    setTimeout(() => {
      expect(platform.is)
        .toHaveBeenCalledWith('ios');

      expect(appAvailability.check)
        .toHaveBeenCalledWith('instagram://');

      expect(browser.create)
        .toHaveBeenCalledWith(`instagram://user?username=${instagram}`);

      done();
    });
  });
});
