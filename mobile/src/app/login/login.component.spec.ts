import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { LoginComponent } from './login.component';
import { AuthServiceProvider, StylistProfileStatus} from '../shared/auth-service/auth-service';
import { PageNames } from '../shared/page-names';
import { profileStatusToPage } from '../shared/functions';

let fixture: ComponentFixture<LoginComponent>;
let instance: LoginComponent;

describe('Pages: LoginComponent', () => {

  beforeEach(async(() => TestUtils.beforeEachCompiler([LoginComponent])
    .then(compiled => {
      fixture = compiled.fixture;
      instance = compiled.instance;
    })));

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

  it('should authenticate after login is called with valid credentials', async(() => {

    const authService = TestBed.get(AuthServiceProvider);

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

  it('should fail to authenticate after login is called with wrong password', async(() => {

    const authService = TestBed.get(AuthServiceProvider);

    expect(authService.getAuthToken())
      .toEqual(undefined);

    instance.formData.email = 'user@test.com';
    instance.formData.password = 'wrongpassword';

    instance.login()
      .then(() => {
        expect(authService.getAuthToken())
          .toEqual(undefined);
      });
  }));

  it('should correctly map stylist profile completeness to pages', async(() => {
    // Check edge cases (checking all combinations is not feasible)

    // No profile
    expect(profileStatusToPage(undefined))
      .toEqual(PageNames.RegisterSalon);

    // Full profile
    const profileStatus: StylistProfileStatus = {
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
