import * as faker from 'faker';

import { click, waitFor } from './shared-e2e/utils';
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
import { myStylistsPage } from './pages/my-stylists-page';

describe('Stylists add/remove flow', () => {

  let clientPhoneNumber;
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  it('Can navigate full registration flow without reloads', async () => {
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
  });

  // TODO: fix all xit tests when we will have new home page
  xit('Can navigate to my stylists tab', async () => {
    await mainTabsPage.goToMyStylists();
  });

  xit('Can navigate to search stylists page and add one more stylist', async () => {
    await myStylistsPage.goToStylistSearch();
    await stylistsSearchPage.addFirstStylist();
  });

  xit('Can navigate to search stylists page and add one nonBookable stylist', async () => {
    // NOTE: this code has potential problem, it assumes that non-bookable stylist exists
    await stylistsSearchPage.addNonBookableStylist();
    await click(stylistsSearchPage.goBack);
    await waitFor(mainTabsPage.stylsitsTab);
  });

  xit('Can navigate to my saved stylists tab and remove first stylist', async () => {
    await myStylistsPage.changeTabToSavedStylists();
    await myStylistsPage.selectFirstSavedStylistAndRemoveIt();
  });

  it('Can logout', async () => {
    await performLogout();
  });
});
