import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '~/../test';

import { FollowersApiMock } from '~/core/api/followers.api.mock';
import { ProfileApi } from '~/core/api/profile-api';
import { ProfileApiMock, profileNotCompleate } from '~/core/api/profile-api.mock';
import { ProfileModel } from '~/core/api/profile.models';
import { FollowersApi } from '~/core/api/followers.api';
import { FollowersResponse } from '~/core/api/followers.models';

import { FollowersComponent } from '~/followers/followers.component';
import { ApiResponse } from '~/shared/api/base.models';
import { NavParams } from 'ionic-angular';
import { stylistsMock, StylistsServiceMock } from '~/core/api/stylists-service.mock';
import { StylistsService } from '~/core/api/stylists-service';

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

          const navParams = fixture.debugElement.injector.get(NavParams);
          navParams.data.stylist = stylistsMock[0];

          const profileApi = fixture.debugElement.injector.get(ProfileApi);
          const profileApiMock = fixture.debugElement.injector.get(ProfileApiMock);
          spyOn(profileApi, 'getProfile').and.returnValue(
            profileApiMock.getProfile()
          );
          profileApiMock.getProfile().subscribe((apiRes: ApiResponse<ProfileModel>) => {
            instance.profile = apiRes.response;
          });

          const followersApi = fixture.debugElement.injector.get(FollowersApi);
          const followersApiMock = fixture.debugElement.injector.get(FollowersApiMock);
          spyOn(followersApi, 'getFollowers').and.returnValue(
            followersApiMock.getFollowers('')
          );
          followersApiMock.getFollowers('').subscribe((apiRes: ApiResponse<FollowersResponse>) => {
            instance.followers = apiRes.response.followers;
          });

          instance.ionViewWillEnter();
          fixture.detectChanges();
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should load the data', () => {
    expect(instance.followers).toBeDefined();
    expect(instance.profile).toBeDefined();
  });

  it('should show followers popup if stylist have followers', done => {
    spyOn(instance, 'showFollowersPopup').and.callThrough();

    fixture.detectChanges();

    instance.showFollowersPopup(instance.followers[0]);

    const stylistFollowerItem = fixture.nativeElement.querySelector('[data-test-id=stylistFollowerItem]');
    expect(stylistFollowerItem.innerText.trim()).toBe(`${instance.followers[0].first_name} ${instance.followers[0].last_name}`);

    stylistFollowerItem.click();
    expect(instance.showFollowersPopup).toHaveBeenCalled();

    done();
  });

  it('should have a link to privacy settings page', () => {
    const privacySettings = fixture.nativeElement.querySelector('[data-test-id=privacySettings]');
    expect(privacySettings).toBeDefined();
  });

  it('should have title with followers count', done => {
    fixture.detectChanges();
    const stylistName = fixture.nativeElement.querySelector('[data-test-id=stylistName]');
    expect(stylistName.innerText).toBe(`${instance.stylist.first_name}'s Clients ${instance.followers.length}`);

    done();
  });

  it('should have list of followers', done => {
    fixture.detectChanges();

    const stylistFollowerItem = fixture.nativeElement.querySelector('[data-test-id=stylistFollowerItem]');
    expect(stylistFollowerItem.innerText.trim()).toBe(`${instance.followers[0].first_name} ${instance.followers[0].last_name}`);

    done();
  });
});
