import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '~/../test';

import { StylistsServiceMock } from '~/core/api/stylists.service.mock';
import { StylistsService } from '~/core/api/stylists.service';
import { NavParams } from 'ionic-angular';
import { StylistProfileComponent } from '~/stylists/stylist-profile/stylist-profile.component';
import { StylistProfileApi } from '~/shared/api/stylist-profile.api';
import { StylistProfileApiMock } from '~/shared/api/stylist-profile.api.mock';

let fixture: ComponentFixture<StylistProfileComponent>;
let instance: StylistProfileComponent;

describe('StylistProfileComponent', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([StylistProfileComponent], [
        StylistProfileApi,
        StylistProfileApiMock,
        StylistsServiceMock
      ])
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

          const stylistProfileApi = fixture.debugElement.injector.get(StylistProfileApi);
          const stylistProfileApiMock = fixture.debugElement.injector.get(StylistProfileApiMock);
          spyOn(stylistProfileApi, 'getStylistProfile').and.returnValue(
            stylistProfileApiMock.getStylistProfile()
          );

          const preferredApiRes = await stylistsServiceMock.getPreferredStylists().get();
          const stylistProfile = await stylistProfileApiMock.getStylistProfile().get();

          const navParams = fixture.debugElement.injector.get(NavParams);
          if (preferredApiRes.response) {
            navParams.data.params = {
              stylist: preferredApiRes.response.stylists[0]
            };
          }
          if (stylistProfile.response) {
            instance.stylistProfile = stylistProfile.response;
          }

          instance.ionViewWillEnter();
          fixture.detectChanges();
        })
    )
  );

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

  it('should show all data set', async(() => {
    const stylistProfilePreviewName = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewName]');
    expect(stylistProfilePreviewName.innerText).toContain(instance.stylistProfile.first_name);

    const stylistProfilePreviewSalon = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewSalon]');
    expect(stylistProfilePreviewSalon.innerText).toContain(instance.stylistProfile.salon_name);

    const stylistProfilePreviewClients = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewClients]');
    expect(stylistProfilePreviewClients.innerText).toContain(instance.stylistProfile.followers_count);

    const stylistProfilePreviewAddress = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewAddress]');
    expect(stylistProfilePreviewAddress.innerText).toContain(instance.stylistProfile.salon_address);

    const stylistProfilePreviewInstagram = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewInstagram]');
    expect(stylistProfilePreviewInstagram.innerText).toContain(instance.stylistProfile.instagram_url);

    const stylistProfilePreviewWebsite = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewWebsite]');
    expect(stylistProfilePreviewWebsite.innerText).toContain(instance.stylistProfile.website_url);

    const stylistProfilePreviewEmail = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewEmail]');
    expect(stylistProfilePreviewEmail.innerText).toContain(instance.stylistProfile.email);

    const stylistProfilePreviewPhone = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewPhone]');
    expect(stylistProfilePreviewPhone.innerText).toContain(instance.stylistProfile.phone);
  }));

  it('should have footer with book button for bookable stylist', () => {
    const stylistProfilePreviewFooter = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewFooter]');
    expect(stylistProfilePreviewFooter).toBeDefined();
    expect(stylistProfilePreviewFooter.innerText).toContain(`Book with ${instance.stylistProfile.first_name}`);
  });

  it('should have calendar', () => {
    const stylistProfilePreviewCalendar = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewCalendar]');
    expect(stylistProfilePreviewCalendar).toBeDefined();
  });

  it('should not see calendar if this is nonBookable stylist', () => {
    instance.stylistProfile.is_profile_bookable = false;
    fixture.detectChanges();

    const stylistProfilePreviewCalendar = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewCalendar]');
    expect(stylistProfilePreviewCalendar).toBeNull();

    const stylistProfilePreviewNoCalendar = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewNoCalendar]');
    expect(stylistProfilePreviewNoCalendar).toBeDefined();
    expect(stylistProfilePreviewNoCalendar.innerText).toContain(`No Calendar Available`);
  });

  it('should have footer with call button for non bookable stylist', () => {
    instance.stylistProfile.is_profile_bookable = false;
    fixture.detectChanges();

    const stylistProfilePreviewFooterCall = fixture.nativeElement.querySelector('[data-test-id=stylistProfilePreviewFooterCall]');
    expect(stylistProfilePreviewFooterCall).toBeDefined();
    expect(stylistProfilePreviewFooterCall.innerText).toContain(`Call ${instance.stylistProfile.first_name}`);
  });
});
