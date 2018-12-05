import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '~/../test';

import { StylistsServiceMock } from '~/core/api/stylists.service.mock';
import { StylistsService } from '~/core/api/stylists.service';
import { MyStylistsComponent, MyStylistsTabs } from '~/stylists/my-stylists.component';
import { ApiResponse } from '~/shared/api/base.models';
import { PreferredStylistModel, PreferredStylistsListResponse } from '~/shared/api/stylists.models';

let fixture: ComponentFixture<MyStylistsComponent>;
let instance: MyStylistsComponent;

describe('MyStylistsComponent', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([MyStylistsComponent], [StylistsServiceMock])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
        .then(async () => {
          const stylistsService = fixture.debugElement.injector.get(StylistsService);
          const stylistsServiceMock = fixture.debugElement.injector.get(StylistsServiceMock);

          spyOn(stylistsService, 'getPreferredStylists').and.returnValue(
            stylistsServiceMock.getPreferredStylists()
          );

          stylistsServiceMock.getPreferredStylists().subscribe((apiRes: ApiResponse<PreferredStylistsListResponse>) => {
            const stylists: PreferredStylistModel[] = apiRes.response.stylists;
            instance.totalStylistsCount = stylists.length;
            instance.splitStylistsList(stylists);
            fixture.detectChanges();
          });

          instance.ionViewDidLoad();
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have stylists in both tabs', () => {
    const myStylistsTabList = fixture.nativeElement.querySelectorAll('[data-test-id=myStylistsTabList] stylist-card');
    expect(myStylistsTabList.length).toBe(instance.tabs[MyStylistsTabs.primeStylists].stylists.length);
    const savedStylistsTabList = fixture.nativeElement.querySelectorAll('[data-test-id=savedStylistsTabList] stylist-card');
    expect(savedStylistsTabList.length).toBe(instance.tabs[MyStylistsTabs.savedStylists].stylists.length);
  });

  it('should have title with number of all stylist', () => {
    const myStylistsTitle = fixture.nativeElement.querySelector('[data-test-id=myStylistsTitle]');
    expect(myStylistsTitle.outerText).toContain(`Stylists ${instance.totalStylistsCount}`);
  });

  it('should show "There Is no preferred stylists yet"', () => {
    instance.tabs[MyStylistsTabs.primeStylists].stylists = [];
    fixture.detectChanges();

    const savedStylistsTabList = fixture.nativeElement.querySelector('[data-test-id=myStylistsTabList]');
    expect(savedStylistsTabList.outerText.trim())
      .toContain('You did not select preferred stylists yet.');
  });

  it('should show "There Is no saved stylists yet"', () => {
    instance.tabs[MyStylistsTabs.savedStylists].stylists = [];
    fixture.detectChanges();

    const savedStylistsTabList = fixture.nativeElement.querySelector('[data-test-id=savedStylistsTabList]');
    expect(savedStylistsTabList.outerText.trim())
      .toContain('You did not save any stylists yet.');
  });

  it('should not be able to open stylist clients page if this is not-bookable profile', () => {
    const stylistFollowers = fixture.nativeElement.querySelector('[data-test-id=savedStylistsTabList] stylist-card [data-test-id=stylistFollowers]');
    expect(stylistFollowers.className)
      .toContain('is-notBookable');
  });

  it('should not be able to remove last primeStylists', () => {
    instance.tabs[MyStylistsTabs.primeStylists].stylists.length = 1;
    fixture.detectChanges();

    const savedStylistsTabList = fixture.nativeElement.querySelector('[data-test-id=removeStylist]');
    expect(savedStylistsTabList).toBeNull();
  });
});
