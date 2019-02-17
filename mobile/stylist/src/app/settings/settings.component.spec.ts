import { ComponentFixture } from '@angular/core/testing';
import { NavController } from 'ionic-angular';
import { AppAvailability } from '@ionic-native/app-availability';
import { Clipboard } from '@ionic-native/clipboard';
import { EmailComposer } from '@ionic-native/email-composer';
import { HttpClient, HttpHandler } from '@angular/common/http';

import { ExternalAppService } from '~/shared/utils/external-app-service';

import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { PageNames } from '~/core/page-names';
import { TestUtils } from '../../test';
import { SettingsComponent } from '~/settings/settings.component';
import { StylistServiceProvider } from '~/core/api/stylist.service';
import { StylistServiceMock } from '~/core/api/stylist.service.mock';
import { DecimalPipe } from '@angular/common';

let fixture: ComponentFixture<SettingsComponent>;
let instance: SettingsComponent;

describe('Pages: SettingsComponent', () => {

  prepareSharedObjectsForTests();

  beforeEach(async () => TestUtils.beforeEachCompiler(
    [SettingsComponent],
    [
      NavController,
      AppAvailability,
      Clipboard,
      EmailComposer,
      HttpHandler,
      ExternalAppService,
      StylistServiceMock,
      DecimalPipe,
      { provide: HttpClient, useClass: class { httpClient = jasmine.createSpy('HttpClient'); } }
    ])
    .then(async compiled => {
      fixture = compiled.fixture;
      instance = compiled.instance;

      const stylistProfileApi = fixture.debugElement.injector.get(StylistServiceProvider);
      const stylistProfileApiMock = fixture.debugElement.injector.get(StylistServiceMock);
      spyOn(stylistProfileApi, 'getStylistSettings').and.returnValue(
        stylistProfileApiMock.getStylistSettings()
      );

      instance.ionViewWillLoad();
      const { response } = await stylistProfileApi.getStylistSettings().get();
      if (response) {
        instance.settings = response;
      }
      fixture.detectChanges();
    }));

  it('should create the page', () => {
    expect(instance).toBeTruthy();
  });

  xit('should have all links', () => {
    spyOn(instance, 'navigateToTaxRate');
    spyOn(instance, 'navigateTo');
    spyOn(instance, 'onContactByEmail');

    const settingsGoogleCalendar = fixture.nativeElement.querySelector('[data-test-id=settingsGoogleCalendar]');
    expect(settingsGoogleCalendar.outerText.trim())
      .toContain('Google Calendar');

    const settingsTaxRate = fixture.nativeElement.querySelector('[data-test-id=settingsTaxRate]');
    expect(settingsTaxRate.outerText.trim())
      .toContain('Tax Rate');
    settingsTaxRate.click();
    expect(instance.navigateToTaxRate).toHaveBeenCalled();

    const settingsCalendarExample = fixture.nativeElement.querySelector('[data-test-id=settingsCalendarExample]');
    expect(settingsCalendarExample.outerText.trim())
      .toContain('How MADE applies discounts');
    settingsCalendarExample.click();
    expect(instance.navigateTo).toHaveBeenCalledWith(PageNames.CalendarExample, {params: {isRootPage: true}});

    const settingsWelcomeToMade = fixture.nativeElement.querySelector('[data-test-id=settingsWelcomeToMade]');
    expect(settingsWelcomeToMade.outerText.trim())
      .toContain('How MADE works');
    settingsWelcomeToMade.click();
    expect(instance.navigateTo).toHaveBeenCalledWith(PageNames.WelcomeToMade, {params: {isRootPage: true}});

    const settingsEmail = fixture.nativeElement.querySelector('[data-test-id=settingsEmail]');
    expect(settingsEmail.outerText.trim())
      .toContain('FAQ@madebeauty.com');
    settingsEmail.click();
    expect(instance.onContactByEmail).toHaveBeenCalledWith('faq@madebeauty.com');
  });

  it('should have 3 titles', () => {
    const settingsPayoutTitle = fixture.nativeElement.querySelector('[data-test-id=settingsPayoutTitle]');
    expect(settingsPayoutTitle.outerText.trim())
      .toContain('Payout Method');

    const settingsTaxTitle = fixture.nativeElement.querySelector('[data-test-id=settingsTaxTitle]');
    expect(settingsTaxTitle.outerText.trim())
      .toContain('Taxes and Fees');

    const settingsAboutTitle = fixture.nativeElement.querySelector('[data-test-id=settingsAboutTitle]');
    expect(settingsAboutTitle.outerText.trim())
      .toContain('About MADE');
  });

  it('should have rounded tax', () => {
    const decimalPipe = fixture.debugElement.injector.get(DecimalPipe);

    const settingsTaxRate = fixture.nativeElement.querySelector('[data-test-id=settingsTaxRate]');
    expect(settingsTaxRate.outerText.trim())
      .toContain(`${ decimalPipe.transform(instance.settings.tax_percentage, '1.2')  }%`);
  });
});
