import { async, ComponentFixture } from '@angular/core/testing';
import { NavController } from 'ionic-angular';

import { TestUtils } from '~/../test';

import { SharedSingletonsModule } from '~/shared/shared-singletons.module';
import { CoreModule } from '~/core/core.module';

import { PageNames } from '~/core/page-names';

import { AuthEffects } from '~/auth/auth.effects';
import { AuthService } from '~/auth/auth.api';
import { AuthPageComponent } from './auth-start.component';

const countriesMock = [
  { alpha2: 'CA', name: 'Canada', countryCallingCodes: ['+1'] },
  { alpha2: 'US', name: 'United States', countryCallingCodes: ['+1'] },
  { alpha2: 'RU', name: 'Russian Federation', countryCallingCodes: ['+7'] }
];

const testPhone = `347${Math.random().toString().slice(2, 9)}`;

let fixture: ComponentFixture<AuthPageComponent>;
let instance: AuthPageComponent;

const components = [AuthPageComponent];
const providers = [];
const imports = [SharedSingletonsModule, CoreModule];

describe('Pages: Auth Phone', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler(components, providers, imports)
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
        .then(() => {
          // Current spec setup:
          instance.countries = countriesMock;
          fixture.detectChanges();
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should contain proper texts', () => {
    expect(fixture.nativeElement.textContent)
      .toContain('Phone number');

    expect(fixture.nativeElement.textContent)
      .toContain('Enter your phone number to get a code');

    expect(fixture.nativeElement.textContent)
      .toContain('Continue');
  });

  it('should have country data', () => {
    expect(instance.countries)
      .toBeTruthy();

    expect(fixture.nativeElement.querySelector('[data-test-id=countrySelect] .select-text').textContent)
      .toContain('+1');
  });

  it('should type and format phone code', () => {
    instance.phone.patchValue(testPhone);

    expect(instance.phone.value)
      .toEqual(testPhone);

    // Perform formatting:
    const blurEvent = new Event('ionBlur');
    const phoneInput = fixture.nativeElement.querySelector('[data-test-id=phoneInput]');
    phoneInput.dispatchEvent(blurEvent);

    expect(phoneInput.querySelector('input').value)
      .toEqual(`${testPhone.slice(0, 3)} ${testPhone.slice(3, 6)}-${testPhone.slice(6, 10)}`);

    fixture.detectChanges();
  });

  it('should submit the phone', async done => {
    const navCtrl = fixture.debugElement.injector.get(NavController);

    instance.phone.patchValue(testPhone);
    instance.submit();

    const authEffects = fixture.debugElement.injector.get(AuthEffects);
    await authEffects.getCodeRequest.first().toPromise();

    expect(navCtrl.push)
      .toHaveBeenCalledWith(PageNames.AuthConfirm, { phone: `+1${testPhone}` });

    done();
  });

  it('should call the API when submitting', () => {
    const authService = fixture.debugElement.injector.get(AuthService);

    spyOn(authService, 'getCode');

    instance.phone.patchValue(testPhone);
    instance.submit();

    expect(authService.getCode)
      .toHaveBeenCalledWith({ phone: `+1${testPhone}` }, { hideGenericAlertOnFieldAndNonFieldErrors: true });
  });
});
