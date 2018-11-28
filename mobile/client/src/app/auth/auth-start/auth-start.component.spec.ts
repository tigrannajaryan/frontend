import { async, ComponentFixture } from '@angular/core/testing';
import { NavController } from 'ionic-angular';

import { TestUtils } from '~/../test';

import { AuthService } from '~/shared/api/auth.api';
import { PhoneInputComponent } from '~/shared/components/phone-input/phone-input.component';
import { randomPhone, replaceNbspWithSpaces } from '~/shared/utils/test-utils';

import { PageNames } from '~/core/page-names';

import { AuthPageComponent } from './auth-start.component';

const countriesMock = [
  {
    alpha2: 'CA',
    name: 'Canada',
    countryCallingCodes: ['+1'],
    ioc: 'CAN'
  },
  {
    alpha2: 'US',
    name: 'United States',
    countryCallingCodes: ['+1'],
    ioc: 'USA'
  },
  {
    alpha2: 'RU',
    name: 'Russian Federation',
    countryCallingCodes: ['+7'],
    ioc: 'RUS'
  }
];

const testPhone = randomPhone();
const testPhoneNoCode = testPhone.slice(2);

let fixture: ComponentFixture<AuthPageComponent>;
let instance: AuthPageComponent;

let textContent: string;

describe('Pages: Auth Phone', () => {
  beforeEach(
    async(() => {
      PhoneInputComponent.countries = countriesMock;

      return TestUtils.beforeEachCompiler([AuthPageComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
        .then(() => {
          // Current spec setup:
          fixture.detectChanges();

          textContent = replaceNbspWithSpaces(fixture.nativeElement.textContent);
        });
    })
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should contain proper texts', () => {
    expect(textContent)
      .toContain('Phone number');

    expect(textContent)
      .toContain('Enter your phone number to get a code');

    expect(textContent)
      .toContain('Continue');
  });

  it('should have country data', () => {
    expect(fixture.nativeElement.querySelector('[data-test-id=countrySelect] .select-text').textContent)
      .toContain('+1');
  });

  it('should type and format phone code', () => {
    instance.phoneInput.phone.patchValue(testPhoneNoCode);

    // Perform formatting:
    const blurEvent = new Event('ionBlur');
    const phoneInput = fixture.nativeElement.querySelector('[data-test-id=phoneInput]');
    phoneInput.dispatchEvent(blurEvent);

    expect(phoneInput.querySelector('input').value)
      .toEqual(`${testPhoneNoCode.slice(0, 3)} ${testPhoneNoCode.slice(3, 6)}-${testPhoneNoCode.slice(6, 10)}`);

    fixture.detectChanges();
  });

  it('should submit the phone', async done => {
    const navCtrl = fixture.debugElement.injector.get(NavController);

    instance.phoneInput.phone.patchValue(testPhoneNoCode);
    instance.phoneInput.onChange(); // notify page

    await instance.submit();

    expect(navCtrl.push)
      .toHaveBeenCalledWith(PageNames.AuthConfirm, { params: { phone: testPhone } });

    done();
  });

  it('should call the API when submitting', () => {
    const authService = fixture.debugElement.injector.get(AuthService);

    spyOn(authService, 'getCode');

    instance.phone = testPhone;
    instance.submit();

    expect(authService.getCode)
      .toHaveBeenCalledWith({ phone: testPhone }, { hideGenericAlertOnFieldAndNonFieldErrors: true });
  });
});
