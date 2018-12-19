import { async, ComponentFixture } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Camera } from '@ionic-native/camera';
import { ActionSheetController } from 'ionic-angular';
import { MapsAPILoader } from '@agm/core';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { ProfileDataStore } from '~/core/profile.data';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { TestUtils } from '../../test';
import { ProfileComponent, ProfileTabNames } from './profile.component';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';
import { calcProfileCompleteness } from '~/core/utils/stylist-utils';

let fixture: ComponentFixture<ProfileComponent>;
let instance: ProfileComponent;

describe('Pages: ProfileComponent', () => {

  prepareSharedObjectsForTests();

  // TestBed.createComponent(ProfileComponent) inside
  // see https://angular.io/guide/testing#component-class-testing for more info
  beforeEach(() => TestUtils.beforeEachCompiler(
    [
      ProfileComponent
    ], [
      MapsAPILoader,
      HttpClient,
      HttpHandler,
      Logger,
      ServerStatusTracker,
      Camera,
      ActionSheetController,
      LaunchNavigator,
      ProfileDataStore
    ]).then(async (compiled) => {
      fixture = compiled.fixture; // https://angular.io/api/core/testing/ComponentFixture
      instance = compiled.instance;
      instance.ionViewWillEnter();

      const { response } = await instance.profileData.get();
      if (response) {
        instance.rawPhone = response.phone;
        const formattedPhone = getPhoneNumber(response.phone);
        const formattedPublicPhone = getPhoneNumber(response.public_phone);

        instance.form.patchValue({
          // tslint:disable-next-line:no-null-keyword
          profile_photo_url: response.profile_photo_url,
          first_name: response.first_name,
          last_name: response.last_name,
          phone: formattedPhone,
          public_phone: formattedPublicPhone,
          salon_name: response.salon_name,
          salon_address: response.salon_address,
          profile_photo_id: response.profile_photo_id,
          instagram_url: response.instagram_url,
          followers_count: response.followers_count,
          email: response.email,
          website_url: response.website_url
        });

        instance.stylistProfileCompleteness = calcProfileCompleteness(response);
      }

      fixture.detectChanges();
    })
  );

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

  it('should have two tabs', () => {
    const profileTabs = fixture.nativeElement.querySelector('[data-test-id=profileTabs]');
    expect(profileTabs.innerText).toContain(ProfileTabNames.edit);
    expect(profileTabs.innerText).toContain(ProfileTabNames.clientView);
  });

  it('should have not a complete profile', () => {
    instance.stylistProfileCompleteness = calcProfileCompleteness(instance.form.value);
    expect(instance.stylistProfileCompleteness.isProfileComplete).toBe(false);

    const isProfileComplete = fixture.nativeElement.querySelector('[data-test-id=isProfileComplete]');
    expect(isProfileComplete).toBeDefined();

    const completenessPercent = fixture.nativeElement.querySelector('[data-test-id=completenessPercent]');
    expect(completenessPercent.innerText).toContain(instance.stylistProfileCompleteness.completenessPercent);
  });

  it('should have all needed fields in first tab', async(() => {
    const first_name = fixture.nativeElement.querySelector('[data-test-id=first_name] input');
    expect(first_name.value).toBe(instance.form.get('first_name').value);

    const last_name = fixture.nativeElement.querySelector('[data-test-id=last_name] input');
    expect(last_name.value).toBe(instance.form.get('last_name').value);

    const salon_name = fixture.nativeElement.querySelector('[data-test-id=salon_name] input');
    expect(salon_name.value).toBe(instance.form.get('salon_name').value);

    const salon_address = fixture.nativeElement.querySelector('[data-test-id=salon_address] input');
    expect(salon_address.value).toBe(instance.form.get('salon_address').value);

    const phone = fixture.nativeElement.querySelector('[data-test-id=phone] input');
    expect(phone.value).toBe(instance.form.get('phone').value);

    const public_phone = fixture.nativeElement.querySelector('[data-test-id=public_phone] input');
    expect(public_phone.value).toBe(instance.form.get('public_phone').value);

    const instagram_url = fixture.nativeElement.querySelector('[data-test-id=instagram_url] input');
    expect(instagram_url.value).toBe(instance.form.get('instagram_url').value);

    const email = fixture.nativeElement.querySelector('[data-test-id=email] input');
    expect(email.value).toBe(instance.form.get('email').value);

    const website_url = fixture.nativeElement.querySelector('[data-test-id=website_url] input');
    expect(website_url.value).toBe(instance.form.get('website_url').value);
  }));

  it('should see client view with all filled fields from first tab', async(() => {
    instance.activeTab = ProfileTabNames.clientView;

    const preview_salon_name = fixture.nativeElement.querySelector('[data-test-id=preview_salon_name]');
    expect(preview_salon_name).toBeDefined();

    const preview_name = fixture.nativeElement.querySelector('[data-test-id=preview_name]');
    expect(preview_name).toBeDefined();

    const preview_followers_count = fixture.nativeElement.querySelector('[data-test-id=preview_followers_count]');
    expect(preview_followers_count).toBeDefined();

    const preview_salon_address = fixture.nativeElement.querySelector('[data-test-id=preview_salon_address]');
    expect(preview_salon_address).toBeDefined();

    const preview_instagram_url = fixture.nativeElement.querySelector('[data-test-id=preview_instagram_url]');
    expect(preview_instagram_url).toBeDefined();

    const preview_website_url = fixture.nativeElement.querySelector('[data-test-id=preview_website_url]');
    expect(preview_website_url).toBeDefined();

    const preview_public_phone = fixture.nativeElement.querySelector('[data-test-id=preview_public_phone]');
    expect(preview_public_phone).toBeDefined();
  }));
});
