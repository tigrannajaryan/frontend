import { ComponentFixture } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { AppVersion } from '@ionic-native/app-version';
import 'rxjs/add/observable/of';

import { TestUtils } from '~/../test';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { MadeMenuComponent } from '~/core/components/made-menu/made-menu.component';
import { AuthService } from '~/shared/api/auth.api';
import { ProfileDataStore } from '~/core/profile.data';
import { PageNames } from '~/core/page-names';

let fixture: ComponentFixture<MadeMenuComponent>;
let instance: MadeMenuComponent;

describe('Component: menu', () => {

  prepareSharedObjectsForTests();

  beforeEach(async () => TestUtils.beforeEachCompiler(
    [MadeMenuComponent],
    [AuthService, AppVersion, HttpClient, HttpHandler, ProfileDataStore])
    .then(async compiled => {
      fixture = compiled.fixture;
      instance = compiled.instance;

      instance.ngOnInit();
      const { response } = await instance.profileData.get();
      if (response) {
        instance.profile = response;
      }
      fixture.detectChanges();
    }));

  it('should init the component', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have profile data', () => {
    spyOn(instance, 'setPage');

    const menuProfileLink = fixture.nativeElement.querySelector('[data-test-id=menuProfileLink]');
    expect(menuProfileLink).toBeDefined();

    menuProfileLink.click();
    expect(instance.setPage).toHaveBeenCalledWith(PageNames.RegisterSalon, { isRootPage: true }, false);

    const menuProfileSalon = fixture.nativeElement.querySelector('[data-test-id=menuProfileSalon]');
    expect(menuProfileSalon.innerText).toBeDefined(instance.profile.salon_name);

    const menuProfileName = fixture.nativeElement.querySelector('[data-test-id=menuProfileName]');
    expect(menuProfileName.innerText).toBeDefined(`${instance.profile.first_name} ${instance.profile.last_name}`);

    const menuProfileTitle = fixture.nativeElement.querySelector('[data-test-id=menuProfileTitle]');
    expect(menuProfileTitle.innerText).toBeDefined('View and edit profile');
  });

  it('should have menu list', () => {
    for (let i = 0; i < instance.menuItems.length; i++) {
      const menuItem = fixture.nativeElement.querySelector(`[data-test-id=menuItem${i}]`);
      expect(menuItem.innerText).toContain(instance.menuItems[i].title);
    }
  });

  it('should have Legal - about page link', () => {
    spyOn(instance, 'setPage');
    const menuLegalLink = fixture.nativeElement.querySelector('[data-test-id=menuLegalLink]');
    expect(menuLegalLink).toBeDefined();

    menuLegalLink.click();
    expect(instance.setPage).toHaveBeenCalledWith(PageNames.About, {}, false);
  });

  it('should have Logout link', () => {
    spyOn(instance, 'onLogoutClick');
    const menuLogoutLink = fixture.nativeElement.querySelector('[data-test-id=menuLogoutLink]');
    expect(menuLogoutLink).toBeDefined();

    menuLogoutLink.click();
    expect(instance.onLogoutClick).toHaveBeenCalled();
  });
});
