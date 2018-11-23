import * as faker from 'faker';
import { browser } from 'protractor';

import { click, waitFor, waitForNot } from './shared-e2e/utils';
import { backdoorApi } from './shared-e2e/backdoor-api';

import { firstPage } from './pages/first-page';
import { howMadeWorksPage } from './pages/how-made-works-page';
import { howPricingWorksPage } from './pages/how-pricing-works-page';
import { stylistsSearchPage } from './pages/stylists-search-page';
import { phoneLoginPage } from './shared-e2e/phone-login-page';
import { phoneCodePage } from './shared-e2e/phone-code-page';
import { firstNameLastNamePage } from './pages/firstname-lastname-page';
import { clientApp } from './client-app';
import { pushPrimingPage } from './shared-e2e/push-priming-page';
import { mainTabsPage } from './pages/main-tabs-page';

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

  it('Can input name and surname', async () => {
    await firstNameLastNamePage.fillIn(faker.name.firstName(), faker.name.lastName());
  });

  it('Can navigate through info screens', async () => {
    await howMadeWorksPage.continue();
    await howPricingWorksPage.continue();
  });

  it('Can see stylists search page and add stylist', async () => {
    await waitFor(stylistsSearchPage.searchInput);
    await click(stylistsSearchPage.card);
    await click(stylistsSearchPage.addStylist);
  });

  it('Can navigate to mainTabs', async () => {
    browser.sleep(1000); // VERY BAD: I need to figure out what to wait on instead of sleeping. Will do after merging this PR.
    await pushPrimingPage.allow();
    await waitFor(mainTabsPage.homeTab);
  });
});
