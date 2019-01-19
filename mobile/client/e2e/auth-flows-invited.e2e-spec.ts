import * as faker from 'faker';
import { browser } from 'protractor';

import { waitFor, waitForNot } from './shared-e2e/utils';
import { backdoorApi } from './shared-e2e/backdoor-api';
import { phoneLoginPage } from './shared-e2e/phone-login-page';
import { firstNameLastNamePage } from './pages/firstname-lastname-page';

import { clientApp } from './client-app';
import { firstPage } from './pages/first-page';
import { howMadeWorksPage } from './pages/how-made-works-page';
import { howPricingWorksPage } from './pages/how-pricing-works-page';
import { createTestStylist, performLogin, performLogout } from './test-utils';
import { stylistInvitationPage } from './pages/stylist-invitation-page';
import { mainTabsPage } from './pages/main-tabs-page';
import { pushPrimingPage } from './shared-e2e/push-priming-page';
import { homePage } from './pages/home-page';

describe('Authentication flows for invited client with app reloads', () => {

  let clientPhoneNumber;
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  it('Can create a client with invitation and login', async () => {
    // Create a new phone number for client
    clientPhoneNumber = await backdoorApi.getNewUnusedPhoneNumber();
    const serviceNames = ['Service #1', 'Service #2'];
    const stylistProfile = await createTestStylist(serviceNames, clientPhoneNumber);
    await clientApp.loadNew();
    await firstPage.getStarted();
    await waitFor(phoneLoginPage.phoneInput);
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

  it('Can see invitation', async () => {
    await waitFor(stylistInvitationPage.startBtn);
  });

  it('Can restore auth on reload to stylistInvitationPage', async () => {
    await browser.get('');
    await waitFor(stylistInvitationPage.startBtn);
    await stylistInvitationPage.getStarted();
  });

  it('Can navigate through info screens', async () => {
    await howMadeWorksPage.continue();
    await howPricingWorksPage.continue();
    await pushPrimingPage.allow();
    await waitFor(mainTabsPage.homeTab);
    await waitFor(homePage.bookBtn);
    await homePage.startBooking();
  });

  it('Can restore auth on reload to mainTabsPage', async () => {
    await browser.get('');
    await waitFor(mainTabsPage.homeTab);
    await waitFor(homePage.bookBtn);
  });

  it('Can logout', async () => {
    await performLogout();
  });

  it('Can relogin and start booking', async () => {
    await performLogin(clientPhoneNumber);
    await homePage.startBooking();
  });
});
