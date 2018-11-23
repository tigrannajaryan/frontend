import * as faker from 'faker';

import { async, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs/observable/of';

import { TestUtils } from '~/../test';

import { StylistsEffects } from '~/core/effects/stylists.effects';
import { stylistsMock } from '~/core/api/stylists.service.mock';
import { StylistsService } from '~/core/api/stylists.service';
import { StylistSearchComponent } from '~/stylists/stylists-search/stylists-search.component';

// Monkey patch SEARCHING_DELAY to 0 to avoid slowing down the tests:
StylistsEffects.SEARCHING_DELAY = 0;

const emptyStylistsResponseMock = {
  response: {
    stylists: []
  }
};

let fixture: ComponentFixture<StylistSearchComponent>;
let instance: StylistSearchComponent;

describe('Pages: Stylists Search', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([StylistSearchComponent])
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

  it('should show default stylists list', async done => {
    await instance.ionViewWillLoad();

    // Skip loading:
    setTimeout(() => {
      fixture.detectChanges();

      const textContent = fixture.nativeElement.textContent;

      stylistsMock.forEach(stylist => {
        expect(textContent)
          .toContain(`${stylist.first_name} ${stylist.last_name}`);

        if (stylist.is_profile_bookable) {
          expect(textContent)
            .toContain(stylist.salon_name);
          expect(fixture.nativeElement.textContent)
            .toContain(`${stylist.followers_count} MADE Clients`);
        }
      });

      done();
    });
  });

  it('should show ”Current Location” placeholder when empty location input', () => {
    fixture.detectChanges();

    const locationInput = fixture.nativeElement.querySelector('[data-test-id=locationInput] input');
    expect(locationInput.placeholder)
      .toBe('Current Location');
  });

  it('should use location data in search', async done => {
    await instance.ionViewWillLoad();
    expect(instance.coords)
      .toBeDefined();
    done();
  });

  it('should show ”no stylists in your area yet”', async done => {
    const stylistsService = fixture.debugElement.injector.get(StylistsService);
    spyOn(stylistsService, 'search').and.returnValue(
      of(emptyStylistsResponseMock)
    );

    await instance.ionViewWillLoad();

    // Skip loading:
    setTimeout(() => {
      fixture.detectChanges();

      const textContent = fixture.nativeElement.textContent;
      expect(textContent)
        .toContain("I'm sorry there are no stylists in your area yet. But check back often we're adding new stylists every day!");

      done();
    });
  });

  it('should show ”No stylists found”', async done => {
    const stylistsService = fixture.debugElement.injector.get(StylistsService);
    spyOn(stylistsService, 'search').and.returnValue(
      of(emptyStylistsResponseMock)
    );

    await instance.ionViewWillLoad();
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
});
