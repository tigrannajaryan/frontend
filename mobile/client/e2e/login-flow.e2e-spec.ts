import { browser } from 'protractor';

import { phoneLoginPage } from './phone-login-page';
import { waitFor, waitForNot } from './shared/utils';
import { phoneCodePage } from './phone-code-page';

describe('Login Flow', () => {
  it('Has expected initial state', async () => {
    await browser.get('');

    await waitFor(phoneLoginPage.phoneInput);

    expect(phoneLoginPage.phoneInput.isPresent()).toBeTruthy();
    expect(phoneLoginPage.continueBtn.isPresent()).toBeTruthy();

    expect(phoneLoginPage.phoneInput.getText()).toBe('');
    expect(phoneLoginPage.continueBtn.isEnabled()).toBeFalsy();
  });

  it('Continue button is enabled after entering a valid phone number', async () => {

    // Check that it is disabled initially
    await phoneLoginPage.phoneInput.clear();
    expect(phoneLoginPage.continueBtn.isEnabled()).toBeFalsy();

    // Enter partial phone number and check it is still disabled
    await phoneLoginPage.phoneInput.sendKeys('555');
    expect(phoneLoginPage.continueBtn.isEnabled()).toBeFalsy();

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

  it('Can continue to Code screen', async () => {
    // Enter a valid phone number
    await phoneLoginPage.phoneInput.clear();
    await phoneLoginPage.phoneInput.sendKeys('555-555-0001');

    // And continue to code page
    await phoneLoginPage.continueBtn.click();

    // For some unknown reason Protractor decides to wait infinitely on subsequent
    // actions if we don't disable the synchronization here. Looks like a bug
    // in Protractor or Webdriver.
    browser.ignoreSynchronization = true;

    // Make sure phone number input is no longer visible
    await waitForNot(phoneLoginPage.phoneInput);

    // and code input is visible
    await waitFor(phoneCodePage.codeInput);

    // Enter invalid code
    await phoneCodePage.codeInput.sendKeys('000000');

    // Make sure error message is displayed
    waitFor(phoneCodePage.codeErrorMsg);
    expect(phoneCodePage.codeErrorMsg.getText()).toBe('Please enter a valid code');
  });
});
