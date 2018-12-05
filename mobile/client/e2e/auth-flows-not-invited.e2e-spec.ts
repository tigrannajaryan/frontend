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
import { performLogin, performLogout } from './test-utils';
import { stylistsSearchPage } from './pages/stylists-search-page';
import { mainTabsPage } from './pages/main-tabs-page';
import { pushPrimingPage } from './shared-e2e/push-priming-page';
import { homePage } from './pages/home-page';

describe('Authentication flows for non-invited client with app reloads', () => {

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
    await pushPrimingPage.allow();
    await waitFor(mainTabsPage.homeTab);
    await waitFor(homePage.searchBtn);
    await waitForNot(homePage.bookBtn);
  });

  it('Can logout', async () => {
    await performLogout();
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

  it('Can navigate through howMadeWorksPage screen', async () => {
    await howMadeWorksPage.continue();
  });

  it('Can restore auth on reload to howMadeWorksPage', async () => {
    await browser.get('');
    await howMadeWorksPage.continue();
    await howPricingWorksPage.continue();
    await waitFor(pushPrimingPage.allowBtn);
  });

  it('Can land on mainTabsPage', async () => {
    await pushPrimingPage.allow();
    await waitFor(mainTabsPage.homeTab);
    await homePage.startSearch();
  });

  it('Can restore auth on reload to mainTabsPage', async () => {
    await browser.get('');
    await waitFor(mainTabsPage.homeTab);
    await waitFor(homePage.searchBtn);
    await waitForNot(homePage.bookBtn);
  });

  it('Can logout', async () => {
    await performLogout();
  });
});
