import { async, ComponentFixture } from '@angular/core/testing';
import { NavController, NavParams } from 'ionic-angular';
import { of } from 'rxjs/observable/of';

import { TestUtils } from '~/../test';
import { randomPhone, replaceNbspWithSpaces } from '~/shared/utils/test-utils';

import { AuthService } from '~/shared/api/auth.api';
import { AuthConfirmParams } from '~/shared/components/auth/abstract-auth-confirm.component';

import { AuthConfirmPageComponent } from './auth-confirm.component';

const testPhone = randomPhone();

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
          const params: AuthConfirmParams = { phone: testPhone };

          navParams.data.params = params;

          instance.ionViewWillEnter();
          fixture.detectChanges();

          textContent = replaceNbspWithSpaces(fixture.nativeElement.textContent);
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
      .toContain(`${testPhone.slice(0, 2)} ${testPhone.slice(2, 5)} ${testPhone.slice(5, 8)} ${testPhone.slice(8, 12)}`);
    expect(textContent)
      .toContain('Edit');
  });

  it('should go back on edit phone link click', () => {
    fixture.nativeElement.querySelector('[data-test-id=editPhoneLink]').click();

    const navCtrl = fixture.debugElement.injector.get(NavController);
    expect(navCtrl.pop)
      .toHaveBeenCalled();
  });

  it('should send a new code on re-send code link click', () => {
    const authService = fixture.debugElement.injector.get(AuthService);

    spyOn(authService, 'getCode').and.returnValue(of({}));

    fixture.nativeElement.querySelector('[data-test-id=sendNewCode]').click();

    expect(authService.getCode)
      .toHaveBeenCalledWith(testPhone);
  });
});
