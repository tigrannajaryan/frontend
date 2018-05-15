import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { LoginComponent } from './login.component';
import { AuthServiceProvider } from '../shared/auth-service/auth-service';

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
});
