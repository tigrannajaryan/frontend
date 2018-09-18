import { waitFor, waitForNot } from './shared-e2e/utils';
import { backdoorApi } from './shared-e2e/backdoor-api';

import { phoneLoginPage } from './phone-login-page';
import { phoneCodePage } from './phone-code-page';
import { firstPage } from './first-page';
import { howMadeWorksPage } from './how-made-works-page';
import { howPricingWorksPage } from './how-pricing-works-page';
import { stylistsSearchPage } from './stylists-search-page';
import { clientApp } from './client-app';

describe('First use flow for not invited clients', () => {

  let phoneNumber;

  it('Can navigate to login screen', async () => {

    await clientApp.loadNew();
    await firstPage.getStarted();
    await waitFor(phoneLoginPage.phoneInput);
  });

  it('Gives error message for invalid code', async () => {
    phoneNumber = await backdoorApi.getNewUnusedPhoneNumber();

    // Enter phone number
    await phoneLoginPage.login(phoneNumber);

    // and code input is visible
    await waitFor(phoneCodePage.codeInput);

    // Enter incorrect code
    await phoneCodePage.codeInput.sendKeys('000000');

    // Make sure error message is displayed
    waitFor(phoneCodePage.codeErrorMsg);
    expect(phoneCodePage.codeErrorMsg.getText()).toBe('Please enter a valid code');
  });

  it('Can login with new phone number', async () => {
    const loginCode = await backdoorApi.getCode(`+1${phoneNumber}`);

    // Enter the correct code
    await phoneCodePage.codeInput.clear();
    await phoneCodePage.codeInput.sendKeys(loginCode);

    await waitForNot(phoneCodePage.codeInput);
  });

  it('Can navigate through info screens', async () => {
    await howMadeWorksPage.continue();
    await howPricingWorksPage.continue();
  });

  it('Can see stylists search page', async () => {
    await waitFor(stylistsSearchPage.searchInput);
  });
});
