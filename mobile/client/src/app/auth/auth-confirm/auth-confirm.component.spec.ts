import { async, ComponentFixture } from '@angular/core/testing';
import { NavController, NavParams } from 'ionic-angular';

import { TestUtils } from '~/../test';

import { AuthService } from '~/auth/auth.api';

import { AuthConfirmPageComponent } from './auth-confirm.component';

const testPhone = `+1347${Math.random().toString().slice(2, 9)}`;

let fixture: ComponentFixture<AuthConfirmPageComponent>;
let instance: AuthConfirmPageComponent;

let textContent: string;

describe('Pages: Auth Confirm', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([AuthConfirmPageComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
        .then(() => {
          // Current spec setup:
          const navParams = fixture.debugElement.injector.get(NavParams);
          navParams.data.phone = testPhone;

          instance.ionViewWillEnter();
          fixture.detectChanges();

          textContent = fixture.nativeElement.textContent.replace(/\u00a0/g, ' '); // without &nbsp;
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should contain proper texts', () => {
    expect(textContent)
      .toContain('Verification code');

    expect(textContent)
      .toContain('We’ve sent you a code via text to');
  });

  it('should contain formatted phone and edit link', () => {
    expect(textContent)
      .toContain(`${testPhone.slice(0, 2)} ${testPhone.slice(2, 5)} ${testPhone.slice(5, 8)} ${testPhone.slice(8, 12)} Edit`);
  });

  it('should go back on edit phone link click', () => {
    fixture.nativeElement.querySelector('[data-test-id=editPhoneLink]').click();

    const navCtrl = fixture.debugElement.injector.get(NavController);
    expect(navCtrl.pop)
      .toHaveBeenCalled();
  });

  it('should send a new code on re-send code link click', () => {
    const authService = fixture.debugElement.injector.get(AuthService);

    spyOn(authService, 'getCode');

    fixture.nativeElement.querySelector('[data-test-id=sendNewCode]').click();

    expect(authService.getCode)
      .toHaveBeenCalledWith({ phone: testPhone }, { hideGenericAlertOnFieldAndNonFieldErrors: true });
  });
});
