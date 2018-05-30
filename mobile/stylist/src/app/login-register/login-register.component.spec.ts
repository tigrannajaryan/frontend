import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUtils } from '../../test';
import { LoginRegisterComponent } from './login-register.component';
import { PageNames } from '~/core/page-names';
import { profileStatusToPage } from '~/core/functions';
import { AuthApiService, ProfileStatus } from '~/core/auth-api-service/auth-api-service';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

let fixture: ComponentFixture<LoginRegisterComponent>;
let instance: LoginRegisterComponent;

describe('Pages: LoginRegisterComponent', () => {

  prepareSharedObjectsForTests();

  beforeEach(async(() => TestUtils.beforeEachCompiler([LoginRegisterComponent])
    .then(compiled => {
      fixture = compiled.fixture;
      instance = compiled.instance;
    })));

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

  it('should authenticate after login-register is called with valid credentials', async(() => {

    const authService = TestBed.get(AuthApiService);

    expect(authService.getAuthToken())
      .toEqual(undefined);

    instance.formData.email = 'user@test.com';
    instance.formData.password = 'pass123';

    instance.login()
      .then(() => {
        expect(authService.getAuthToken())
          .toEqual('test-token');
      });
  }));

  it('should fail to authenticate after login-register is called with wrong password', async(() => {

    const authService = TestBed.get(AuthApiService);

    expect(authService.getAuthToken()).toEqual(undefined);

    instance.formData.email = 'user@test.com';
    instance.formData.password = 'wrongpassword';

    instance.login().catch(e => {
      expect(authService.getAuthToken()).toEqual(undefined);
    });
  }));

  it('should correctly map stylist profile completeness to pages', async(() => {
    // Check edge cases (checking all combinations is not feasible)

    // No profile
    expect(profileStatusToPage(undefined))
      .toEqual(PageNames.RegisterSalon);

    // Full profile
    const profileStatus: ProfileStatus = {
      has_business_hours_set: true,
      has_invited_clients: true,
      has_other_discounts_set: true,
      has_personal_data: true,
      has_picture_set: true,
      has_services_set: true,
      has_weekday_discounts_set: true
    };
    expect(profileStatusToPage(profileStatus))
      .toEqual(PageNames.Today);
  }));
});
