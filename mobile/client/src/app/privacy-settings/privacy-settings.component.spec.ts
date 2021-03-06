import { NavParams } from 'ionic-angular';
import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '~/../test';

import { PrivacyMode, PrivacySettingsComponent } from '~/privacy-settings/privacy-settings.component';
import { ProfileApiMock } from '~/core/api/profile-api.mock';
import { ProfileApi } from '~/core/api/profile-api';
import { FollowersApi } from '~/core/api/followers.api';
import { FollowersApiMock } from '~/core/api/followers.api.mock';
import { FollowersResponse } from '~/core/api/followers.models';
import { ProfileModel } from '~/core/api/profile.models';
import { ApiResponse } from '~/shared/api/base.models';


let fixture: ComponentFixture<PrivacySettingsComponent>;
let instance: PrivacySettingsComponent;

describe('Pages: Privacy Settings', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([PrivacySettingsComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
        .then(async () => {
          const navParams = fixture.debugElement.injector.get(NavParams);
          const profileApi = fixture.debugElement.injector.get(ProfileApi);
          const profileApiMock = await fixture.debugElement.injector.get(ProfileApiMock);
          const { response } = await profileApiMock.getProfile().get();
          navParams.data.profile = response;

          spyOn(profileApi, 'getProfile').and.returnValue(
            profileApiMock.getProfile()
          );

          profileApiMock.getProfile().subscribe((apiRes: ApiResponse<ProfileModel>) => {
            const profile: ProfileModel = apiRes.response;
            instance.profile = profile;
          });

          fixture.detectChanges();
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have profile data', () => {
    expect(instance.profile).toBeDefined();
  });

  it('should have correct titles', () => {
    const h1 = fixture.nativeElement.querySelector('[data-test-id=privacySettingsH1]');
    expect(h1.innerText).toBe('Privacy Settings');

    const h2 = fixture.nativeElement.querySelector('[data-test-id=privacySettingsH2]');
    expect(h2.innerText).toBe('Default privacy settings');


    const h3 = fixture.nativeElement.querySelector('[data-test-id=privacySettingsH3]');
    expect(h3.innerText).toBe('Select your default privacy setting.');
  });

  it('should have check mark at public item', () => {
    instance.profile.privacy = PrivacyMode.public;
    fixture.detectChanges();

    const privacySettingsPublicMode = fixture.nativeElement.querySelector('[data-test-id=privacySettingsPublicMode]');
    expect(privacySettingsPublicMode.style.visibility).toBe('visible');
  });

  it('should have check mark at public item', () => {
    instance.profile.privacy = PrivacyMode.private;
    fixture.detectChanges();

    const privacySettingsPrivateMode = fixture.nativeElement.querySelector('[data-test-id=privacySettingsPrivateMode]');
    expect(privacySettingsPrivateMode.style.visibility).toBe('visible');
  });

  it('should show popup on privacy change', () => {
    const privacySettingsItem = fixture.nativeElement.querySelector('[data-test-id=privacySettingsItem]');
    const showWarningPopupSpy = spyOn(instance, 'showWarningPopup');
    privacySettingsItem.click();
    fixture.detectChanges();

    expect(showWarningPopupSpy).toHaveBeenCalledWith(PrivacyMode.public);
  });
});
