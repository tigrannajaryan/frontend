import { browser } from 'protractor';

import { globals, waitFor } from './shared-e2e/utils';
import { firstPage } from './pages/first-page';
import { loginPage } from './pages/login-page';

describe('Login Page', () => {

  beforeEach(async () => {
    await browser.get('');
    await waitFor(firstPage.getStartedBtn);
    await firstPage.getStarted();
  });

  it('login button navigates to login screen', async () => {
    await waitFor(loginPage.phoneInput);
    expect(loginPage.phoneInput.isEnabled()).toBeTruthy();
    expect(loginPage.continueBtn.isPresent()).toBeTruthy();
    expect(loginPage.continueBtn.isEnabled()).toBeFalsy();
  });
});
