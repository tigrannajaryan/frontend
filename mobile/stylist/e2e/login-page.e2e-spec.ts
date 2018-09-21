import { browser } from 'protractor';

import { globals, waitFor } from './shared-e2e/utils';
import { firstPage } from './pages/first-page';
import { logregPage } from './pages/logreg-page';

describe('Login Page', () => {

  beforeEach(async () => {
    await browser.get('');
    await waitFor(firstPage.loginBtn);
    await firstPage.navigateToLogin();
  });

  it('login button navigates to login screen', () => {
    expect(logregPage.emailInput.isPresent()).toBeTruthy();
    expect(logregPage.passwordInput.isPresent()).toBeTruthy();
    expect(logregPage.loginBtn.isPresent()).toBeTruthy();
    expect(logregPage.registerBtn.isPresent()).toBeFalsy();
  });

  it('login with empty credentials gives alert', async () => {
    await logregPage.loginBtn.click();
    const alertText = globals.alertSubtitle.getText();
    expect(alertText).toContain('Email is required');
    expect(alertText).toContain('Password cannot be blank');
  });

  it('login with wrong credentials gives alert', async () => {
    await logregPage.login('some-wrong-email', 'some-wrong-password');
    expect(globals.alertSubtitle.getText()).toContain('Invalid email or password');
  });
});
