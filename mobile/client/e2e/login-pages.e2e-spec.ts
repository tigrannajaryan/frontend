import { waitFor } from './shared-e2e/utils';
import { phoneLoginPage } from './pages/phone-login-page';
import { firstPage } from './pages/first-page';
import { clientApp } from './client-app';

describe('Login Pages', () => {
  it('Has expected initial state', async () => {

    await clientApp.loadNew();
    await firstPage.getStarted();

    await waitFor(phoneLoginPage.phoneInput);

    expect(phoneLoginPage.phoneInput.isPresent()).toBeTruthy();
    expect(phoneLoginPage.continueBtn.isPresent()).toBeTruthy();

    expect(phoneLoginPage.phoneInput.getText()).toBe('');
    expect(phoneLoginPage.continueBtn.isEnabled()).toBeFalsy();
  });

  it('Continue button is disabled for invalid phone number', async () => {

    // Check that it is disabled initially
    await phoneLoginPage.phoneInput.clear();
    expect(phoneLoginPage.continueBtn.isEnabled()).toBeFalsy();

    // Enter partial phone number and check it is still disabled
    await phoneLoginPage.phoneInput.sendKeys('555');
    expect(phoneLoginPage.continueBtn.isEnabled()).toBeFalsy();
  });

  it('Continue button is enabled after entering a valid phone number', async () => {
    // Enter full phone number and that it is now enabled
    await phoneLoginPage.phoneInput.sendKeys('666-0000');
    expect(phoneLoginPage.continueBtn.isEnabled()).toBeTruthy();

    // Clear the phone number and make sure it is now disabled again
    await phoneLoginPage.phoneInput.clear();

    // Protractor has a bug, the model is not update unless you send a key after clear()
    // See https://github.com/angular/protractor/issues/301
    phoneLoginPage.phoneInput.sendKeys('1');

    expect(phoneLoginPage.continueBtn.isEnabled()).toBeFalsy();
  });
});
