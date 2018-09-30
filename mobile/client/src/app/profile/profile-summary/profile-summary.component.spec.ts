import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '~/../test';

import { ProfileSummaryComponent } from '~/profile/profile-summary/profile-summary.component';
import { ProfileApiMock, profileNotCompleate } from '~/core/api/profile-api.mock';
import { ProfileApi } from '~/core/api/profile-api';
import { ProfileModel } from '~/core/api/profile.models';
import { checkProfileCompleteness } from '~/core/utils/user-utils';
import { FormatPhonePipe } from '~/shared/pipes/format-phone.pipe';

let fixture: ComponentFixture<ProfileSummaryComponent>;
let instance: ProfileSummaryComponent;


describe('Pages: Profile summary', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([ProfileSummaryComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
          instance.ionViewWillEnter();
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have all profile data', () => {
    const profileApi = fixture.debugElement.injector.get(ProfileApi);
    const profileApiMock = fixture.debugElement.injector.get(ProfileApiMock);

    spyOn(profileApi, 'getProfile').and.returnValue(
      profileApiMock.getProfile()
    );

    profileApiMock.getProfile().subscribe(({ response }: { response?: ProfileModel }) => {
      instance.profile = response;
      instance.profileCompleteness = checkProfileCompleteness(response);
      expect(instance.profileCompleteness.isProfileComplete).toBe(true);

      fixture.detectChanges();
      const userName = fixture.nativeElement.querySelector('[data-test-id=userName]');
      expect(userName.innerText).toBe(`${instance.profile.first_name} ${instance.profile.last_name}`);

      const phone = fixture.nativeElement.querySelector('[data-test-id=phone]');
      expect(phone.innerText).toBe(new FormatPhonePipe().transform(instance.profile.phone));

      const email = fixture.nativeElement.querySelector('[data-test-id=email]');
      expect(email.innerText).toBe(instance.profile.email);

      const fixtureAddress = fixture.nativeElement.querySelector('[data-test-id=address]');
      const instanceAddress = `${ instance.profile.city } ${ instance.profile.city && instance.profile.state ? ', ' : '' }${ instance.profile.state }`;
      expect(fixtureAddress.innerText.trim()).toBe(instanceAddress.trim());

      const isProfileComplete = fixture.nativeElement.querySelector('[data-test-id=isProfileComplete]');
      expect(isProfileComplete).toBeNull();
    });
  });

  it('should have not a complete profile', () => {
    const profileApi = fixture.debugElement.injector.get(ProfileApi);
    const profileApiMock = fixture.debugElement.injector.get(ProfileApiMock);

    spyOn(profileApi, 'getProfile').and.returnValue(
      profileApiMock.getProfile()
    );

    const profile: ProfileModel = profileNotCompleate;

    instance.profile = profile;
    instance.profileCompleteness = checkProfileCompleteness(profile);
    expect(instance.profileCompleteness.isProfileComplete).toBe(false);

    fixture.detectChanges();
    const isProfileComplete = fixture.nativeElement.querySelector('[data-test-id=isProfileComplete]');
    expect(isProfileComplete).toBeDefined();


    const completenessPercent = fixture.nativeElement.querySelector('[data-test-id=completenessPercent]');
    expect(completenessPercent.innerText).toContain(instance.profileCompleteness.completenessPercent);
  });

  it('should have edit profile link', () => {
    const editProfileLink = fixture.nativeElement.querySelector('[data-test-id=editProfile]');
    expect(editProfileLink).toBeDefined();
  });

  it('should have How MADE works link', () => {
    const howMADEWorksLink = fixture.nativeElement.querySelector('[data-test-id=howMADEWorks]');
    expect(howMADEWorksLink).toBeDefined();
  });

  it('should have About link', () => {
    const aboutLink = fixture.nativeElement.querySelector('[data-test-id=about]');
    expect(aboutLink).toBeDefined();
  });

  it('should have Logout link', () => {
    const logoutLink = fixture.nativeElement.querySelector('[data-test-id=logout]');
    expect(logoutLink).toBeDefined();
  });

  it('should have email link', () => {
    const logoutLink = fixture.nativeElement.querySelector('[data-test-id=emailLink]');
    expect(logoutLink).toBeDefined();

    spyOn(instance, 'onContactByEmail').and.callThrough();
    instance.onContactByEmail('faq@madebeauty.com');
    expect(instance.onContactByEmail).toHaveBeenCalledWith('faq@madebeauty.com');
  });
});
