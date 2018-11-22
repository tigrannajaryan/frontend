import * as faker from 'faker';
import { browser } from 'protractor';

import { click, waitFor, waitForNot } from './shared-e2e/utils';
import { backdoorApi } from './shared-e2e/backdoor-api';
import { phoneLoginPage } from './shared-e2e/phone-login-page';
import { firstNameLastNamePage } from './pages/firstname-lastname-page';

import { clientApp } from './client-app';
import { firstPage } from './pages/first-page';
import { howMadeWorksPage } from './pages/how-made-works-page';
import { howPricingWorksPage } from './pages/how-pricing-works-page';
import { performLogin } from './test-utils';
import { stylistsSearchPage } from './pages/stylists-search-page';
import { mainTabsPage } from './pages/main-tabs-page';
import { pushPrimingPage } from './shared-e2e/push-priming-page';

describe('Authentication flows with app reloads', () => {

  let clientPhoneNumber;
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  it('Can navigate full flow without reloads', async () => {
    // Create a new phone number for client
    clientPhoneNumber = await backdoorApi.getNewUnusedPhoneNumber();

    await clientApp.loadNew();
    await firstPage.getStarted();
    await waitFor(phoneLoginPage.phoneInput);
    await performLogin(clientPhoneNumber);
    await waitFor(firstNameLastNamePage.submitBtn);
    await firstNameLastNamePage.fillIn(firstName, lastName);
    await howMadeWorksPage.continue();
    await howPricingWorksPage.continue();
    await waitFor(stylistsSearchPage.searchInput);
    await click(stylistsSearchPage.card);
    await click(stylistsSearchPage.addStylist);
    browser.sleep(1000); // VERY BAD: I need to figure out what to wait on instead of sleeping. Will do after merging this PR.
    await pushPrimingPage.allow();
    await waitFor(mainTabsPage.homeTab);
  });

  it('Can start with non invited client', async () => {
    // Create a new phone number for client
    clientPhoneNumber = await backdoorApi.getNewUnusedPhoneNumber();

    await clientApp.loadNew();
    await firstPage.getStarted();
    await waitFor(phoneLoginPage.phoneInput);
  });

  it('Can login with new phone number', async () => {
    await performLogin(clientPhoneNumber);
    await waitFor(firstNameLastNamePage.submitBtn);
  });

  it('Can restore auth on reload to firstNameLastNamePage', async () => {
    await browser.get('');
    await waitFor(firstNameLastNamePage.submitBtn);
  });

  it('Can input name and surname', async () => {
    await firstNameLastNamePage.fillIn(firstName, lastName);
  });

  it('Can navigate through info screens', async () => {
    await howMadeWorksPage.continue();
    await howPricingWorksPage.continue();
    await waitFor(stylistsSearchPage.searchInput);
  });

  it('Can restore auth on reload to howMadeWorksPage', async () => {
    await browser.get('');
    await howMadeWorksPage.continue();
    await howPricingWorksPage.continue();
    await waitFor(stylistsSearchPage.searchInput);
  });

  it('Can land on mainTabsPage', async () => {
    await click(stylistsSearchPage.card);
    await click(stylistsSearchPage.addStylist);
    await waitForNot(stylistsSearchPage.addStylist);
    browser.sleep(1000); // VERY BAD: I need to figure out what to wait on instead of sleeping. Will do after merging this PR.
    await pushPrimingPage.allow();
    await waitFor(mainTabsPage.homeTab);
  });

  it('Can restore auth on reload to mainTabsPage', async () => {
    await browser.get('');
    await waitFor(mainTabsPage.homeTab);
  });
});
