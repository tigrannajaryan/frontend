import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '~/../test';

import { FollowersApiMock } from '~/core/api/followers.api.mock';
import { ProfileApi } from '~/core/api/profile-api';
import { ProfileApiMock } from '~/core/api/profile-api.mock';
import { ProfileModel } from '~/core/api/profile.models';
import { FollowersApi } from '~/core/api/followers.api';
import { FollowersResponse } from '~/core/api/followers.models';

import { FollowersComponent } from '~/followers/followers.component';
import { ApiResponse } from '~/shared/api/base.models';

let fixture: ComponentFixture<FollowersComponent>;
let instance: FollowersComponent;


describe('Pages: Followers', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([FollowersComponent], [FollowersApiMock])
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

  it('should load the data', done => {
    const profileApi = fixture.debugElement.injector.get(ProfileApi);
    const profileApiMock = fixture.debugElement.injector.get(ProfileApiMock);
    const followersApi = fixture.debugElement.injector.get(FollowersApi);
    const followersApiMock = fixture.debugElement.injector.get(FollowersApiMock);

    spyOn(profileApi, 'getProfile').and.returnValue(
      profileApiMock.getProfile()
    );
    spyOn(followersApi, 'getFollowers').and.returnValue(
      followersApiMock.getFollowers('')
    );

    followersApiMock.getFollowers('').subscribe(({ response }: { response?: FollowersResponse }) => {
      instance.followers = response.followers;
      expect(instance.followers).toBeDefined();
    });

    profileApiMock.getProfile().subscribe(({ response }: { response?: ProfileModel }) => {
      instance.profile = response;
      expect(instance.profile).toBeDefined();

      done();
    });
  });

  it('should show followers popup if stylist have followers', done => {
    const profileApi = fixture.debugElement.injector.get(ProfileApi);
    const profileApiMock = fixture.debugElement.injector.get(ProfileApiMock);
    const followersApi = fixture.debugElement.injector.get(FollowersApi);
    const followersApiMock = fixture.debugElement.injector.get(FollowersApiMock);

    spyOn(profileApi, 'getProfile').and.returnValue(
      profileApiMock.getProfile()
    );
    spyOn(followersApi, 'getFollowers').and.returnValue(
      followersApiMock.getFollowers('')
    );
    spyOn(instance, 'showFollowersPopup').and.callThrough();

    followersApiMock.getFollowers('').subscribe(({ response }: { response?: FollowersResponse }) => {
      instance.followers = response.followers;
      instance.showFollowersPopup(instance.followers[0]);
    });

    profileApiMock.getProfile().subscribe(({ response }: { response?: ProfileModel }) => {
      instance.profile = response;
      fixture.detectChanges();

      const stylistFollowerItem = fixture.nativeElement.querySelector('[data-test-id=stylistFollowerItem]');
      expect(stylistFollowerItem.innerText.trim()).toBe(`${instance.followers[0].first_name} ${instance.followers[0].last_name}`);

      stylistFollowerItem.click();
      expect(instance.showFollowersPopup).toHaveBeenCalled();

      done();
    });
  });

  it('should have a link to privacy settings page', () => {
    const privacySettings = fixture.nativeElement.querySelector('[data-test-id=privacySettings]');
    expect(privacySettings).toBeDefined();
  });

  it('should have title with followers count', done => {
    const profileApi = fixture.debugElement.injector.get(ProfileApi);
    const profileApiMock = fixture.debugElement.injector.get(ProfileApiMock);
    const followersApi = fixture.debugElement.injector.get(FollowersApi);
    const followersApiMock = fixture.debugElement.injector.get(FollowersApiMock);

    spyOn(profileApi, 'getProfile').and.returnValue(
      profileApiMock.getProfile()
    );
    spyOn(followersApi, 'getFollowers').and.returnValue(
      followersApiMock.getFollowers('')
    );

    followersApiMock.getFollowers('').subscribe(({ response }: { response?: FollowersResponse }) => {
      instance.followers = response.followers;
    });

    profileApiMock.getProfile().subscribe(({ response }: { response?: ProfileModel }) => {
      instance.profile = response;
      fixture.detectChanges();

      const stylistName = fixture.nativeElement.querySelector('[data-test-id=stylistName]');
      expect(stylistName.innerText).toBe(`${instance.profile.first_name}'s Clients ${instance.followers.length}`);

      done();
    });
  });

  it('should have list of followers', done => {
    const profileApi = fixture.debugElement.injector.get(ProfileApi);
    const profileApiMock = fixture.debugElement.injector.get(ProfileApiMock);
    const followersApi = fixture.debugElement.injector.get(FollowersApi);
    const followersApiMock = fixture.debugElement.injector.get(FollowersApiMock);

    spyOn(profileApi, 'getProfile').and.returnValue(
      profileApiMock.getProfile()
    );
    spyOn(followersApi, 'getFollowers').and.returnValue(
      followersApiMock.getFollowers('')
    );

    followersApiMock.getFollowers('').subscribe(({ response }: { response?: FollowersResponse }) => {
      instance.followers = response.followers;
    });

    profileApiMock.getProfile().subscribe(({ response }: { response?: ProfileModel }) => {
      instance.profile = response;
      fixture.detectChanges();

      const stylistFollowerItem = fixture.nativeElement.querySelector('[data-test-id=stylistFollowerItem]');
      expect(stylistFollowerItem.innerText.trim()).toBe(`${instance.followers[0].first_name} ${instance.followers[0].last_name}`);

      done();
    });
  });
});
