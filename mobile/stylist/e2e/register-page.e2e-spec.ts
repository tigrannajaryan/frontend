import { browser } from 'protractor';

import { getRandomString, globals, waitFor } from './shared/utils';
import { firstPage } from './first-page';
import { logregPage } from './logreg-page';
import { profilePage } from './profile-page';

describe('Register Page', () => {

  const email = `${getRandomString(15)}-test@madebeauty.com`;
  const password = getRandomString(10);
  const firstName = getRandomString(6);
  const lastName = getRandomString(6);

  beforeEach(async () => {
    browser.get('');
    await waitFor(firstPage.registerLink);
    await firstPage.navigateToRegister();
  });

  it('register link navigates to register screen', () => {
    expect(logregPage.emailInput.isPresent()).toBeTruthy();
    expect(logregPage.passwordInput.isPresent()).toBeTruthy();
    expect(logregPage.loginBtn.isPresent()).toBeFalsy();
    expect(logregPage.registerBtn.isPresent()).toBeTruthy();
  });

  it('register with empty credentials gives alert', async () => {
    await logregPage.registerBtn.click();
    const alertText = globals.alertSubtitle.getText();
    expect(alertText).toContain('Email cannot be blank');
    expect(alertText).toContain('Password cannot be blank');
  });

  it('register with invalid email gives alert', async () => {
    logregPage.emailInput.sendKeys('some-wrong-email');
    logregPage.passwordInput.sendKeys('some-wrong-password');

    await logregPage.registerBtn.click();
    expect(globals.alertSubtitle.getText()).toContain('Email is invalid');
  });

  // This test is unstable. Disabled until fixed.
  // it('registration with already existing user gives alert', async () => {
  //   await logregPage.register(email,password);
  //   profilePage.fillForm(firstName, lastName, '', '','', '','');
  //   await browser.navigate().back();
  //   await logregPage.reRegister();
  //   expect(globals.alertSubtitle.getText()).toContain('Email is already registered, try logging in.');
  // });

});
