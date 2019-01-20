import { async, ComponentFixture } from '@angular/core/testing';
import { NavParams } from 'ionic-angular';
import * as faker from 'faker';

import { TestUtils } from '~/../test';

import { stylistsMock } from '~/core/api/stylists.service.mock';
import { StylistSearchComponent, StylistSearchParams } from '~/stylists/stylists-search/stylists-search.component';

// Monkey patch SEARCHING_DELAY to 0 to avoid slowing down the tests:
StylistSearchComponent.SEARCHING_DELAY = 0;

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
        .then(async () => {
          await instance.ionViewWillLoad();
          fixture.detectChanges();
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should show default stylists list', () => {
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
  });

  it('should show ”Current Location” placeholder when empty location input', () => {
    const locationInput = fixture.nativeElement.querySelector('[data-test-id=locationInput] input');
    expect(locationInput.placeholder)
      .toBe('Current Location');
  });

  it('should use location data in search', () => {
    expect(instance.coords)
      .toBeDefined();
  });

  it('should show ”no stylists in your area yet”', async () => {
    instance.stylists = [];

    fixture.detectChanges();

    const textContent = fixture.nativeElement.textContent;
    expect(textContent)
      .toContain("I'm sorry there are no stylists in your area yet. But check back often we're adding new stylists every day!");
  });

  it('should show ”No stylists found”', () => {
    instance.query.patchValue(faker.lorem.word());
    instance.stylists = [];

    fixture.detectChanges();

    const textContent = fixture.nativeElement.textContent;
    expect(textContent)
      .toContain('No stylists found');
  });

  it('should show no back btn when is a main page', () => {
    const navParams = fixture.debugElement.injector.get(NavParams);
    const params: StylistSearchParams = { isMain: true };
    navParams.data = { params };

    instance.ionViewWillLoad();
    fixture.detectChanges();

    // NOTE: .is-hiddenBackButton hides the back btn
    expect(fixture.nativeElement.querySelector('ion-navbar.is-hiddenBackButton [ion-button].back-button'))
      .toBeTruthy();
  });
});
