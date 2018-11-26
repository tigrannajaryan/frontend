import * as faker from 'faker';

import { waitFor, waitForNot } from './shared-e2e/utils';
import { backdoorApi } from './shared-e2e/backdoor-api';
import { phoneLoginPage } from './shared-e2e/phone-login-page';
import { phoneCodePage } from './shared-e2e/phone-code-page';
import { StylistProfile } from './shared-app/api/stylist-app.models';
import { getPhoneNumber } from './shared-app/utils/phone-numbers';
import { pushPrimingPage } from './shared-e2e/push-priming-page';

import { clientApp } from './client-app';
import { firstPage } from './pages/first-page';
import { stylistInvitationPage } from './pages/stylist-invitation-page';
import { howMadeWorksPage } from './pages/how-made-works-page';
import { howPricingWorksPage } from './pages/how-pricing-works-page';
import { mainTabsPage } from './pages/main-tabs-page';
import { profileSummaryPage } from './pages/profile-summary-page';
import { homePage } from './pages/home-page';
import { selectCategoryPage } from './pages/select-category-page';
import { selectServicePage } from './pages/select-service-page';
import { selectDatePage } from './pages/select-date-page';
import { createTestStylist, performLogin } from './test-utils';
import { firstNameLastNamePage } from './pages/firstname-lastname-page';

describe('First use flow for invited client', () => {

  let clientPhoneNumber;
  let stylistProfile: StylistProfile;
  const serviceNames = ['Myservice1', 'Myservice2'];
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  beforeAll(async () => {
    // Create a new phone number for client
    clientPhoneNumber = await backdoorApi.getNewUnusedPhoneNumber();
    stylistProfile = await createTestStylist(serviceNames, clientPhoneNumber);
  });

  it('Can navigate to login screen', async () => {
    await clientApp.loadNew();
    await firstPage.getStarted();
    await waitFor(phoneLoginPage.phoneInput);
  });

  it('Can login with new phone number', async () => {
    await performLogin(clientPhoneNumber);
  });

  it('Can input name and surname', async () => {
    await firstNameLastNamePage.fillIn(firstName, lastName);
  });

  it('Can see invitation', async () => {
    expect(await stylistInvitationPage.salonName.getText()).toEqual(stylistProfile.salon_name);
    expect((await stylistInvitationPage.address.getText()).trim()).toEqual(stylistProfile.salon_address);
    expect(await stylistInvitationPage.stylistName.getText()).toEqual(`${stylistProfile.first_name} ${stylistProfile.last_name}`);
    expect((await stylistInvitationPage.stylistPhone.getText()).trim()).toEqual(getPhoneNumber(`+1 ${stylistProfile.phone}`));

    await stylistInvitationPage.getStarted();
  });

  it('Can navigate through info screens', async () => {
    await howMadeWorksPage.continue();
    await howPricingWorksPage.continue();
    await pushPrimingPage.allow();
  });

  it('Can see profile page', async () => {
    await mainTabsPage.profileTab.click();
    await waitFor(profileSummaryPage.phone);
    expect((await profileSummaryPage.phone.getText()).trim()).toEqual(getPhoneNumber(`+1 ${clientPhoneNumber}`));
    expect((await profileSummaryPage.fullname.getText()).trim()).toEqual(`${firstName} ${lastName}`);
    expect((await profileSummaryPage.profileCompletion.getText()).trim()).toEqual('Profile completion 40%');
  });

  it('Can start booking appointment', async () => {
    await mainTabsPage.homeTab.click();
    await homePage.startBooking();
  });

  it('Can select service category', async () => {
    await selectCategoryPage.selectCategory('color');
  });

  it('Can select service', async () => {
    await waitFor(selectServicePage.serviceRow(serviceNames[0]));
    expect(selectServicePage.servicePrice(serviceNames[0]).getText()).toEqual('$123');
    expect(selectServicePage.categoryName.getText()).toEqual('Color');
    await selectServicePage.selectService(serviceNames[0]);

    expect(selectDatePage.serviceItemName(0).getText()).toEqual(serviceNames[0]);
  });

  it('Can add service', async () => {
    await selectDatePage.addService();
    await selectCategoryPage.selectCategory('color');
    await selectServicePage.selectService(serviceNames[1]);

    waitFor(selectDatePage.serviceItemName(0));
    expect(selectDatePage.serviceItemName(0).getText()).toEqual(serviceNames[0]);
    expect(selectDatePage.serviceItemName(1).getText()).toEqual(serviceNames[1]);
  });
});
