import * as faker from 'faker';
import { formatNumber, parseNumber } from 'libphonenumber-js';

import { getRandomEmail, getRandomString, waitFor, waitForNot } from './shared-e2e/utils';
import { backdoorApi } from './shared-e2e/backdoor-api';

import { phoneLoginPage } from './phone-login-page';
import { phoneCodePage } from './phone-code-page';
import { firstPage } from './first-page';
import { clientApp } from './client-app';
import { stylistApi } from './shared-e2e/stylist-api';
import { AuthCredentials, UserRole } from './shared-app/stylist-api/auth-api-models';
import { ClientInvitation } from './shared-app/stylist-api/invitations.models';
import { stylistInvitationPage } from './stylist-invitation-page';
import { StylistProfile } from './shared-app/stylist-api/stylist-models';
import { howMadeWorksPage } from './how-made-works-page';
import { howPricingWorksPage } from './how-pricing-works-page';
import { mainTabsPage } from './main-tabs-page';
import { profileSummaryPage } from './profile-summary-page';

function normalizePhoneNumber(phone: string): string {
  return formatNumber(parseNumber(phone, 'US'), 'International');
}

describe('First use flow for invited clients', () => {

  let clientPhoneNumber;
  let stylistProfile: StylistProfile;

  beforeAll(async () => {
    // Register new stylist
    const stylistCredentials: AuthCredentials = {
      email: getRandomEmail(),
      password: getRandomString(Math.floor(Math.random() * 20) + 1),
      role: UserRole.stylist
    };
    const authResponse = await stylistApi.registerByEmail(stylistCredentials);
    expect(authResponse.token).toBeDefined();

    // Complete stylist profile
    stylistProfile = {
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      phone: normalizePhoneNumber(await backdoorApi.getNewUnusedPhoneNumber()),
      salon_name: faker.commerce.productName(),
      salon_address: faker.address.streetAddress(),
      instagram_url: faker.internet.url(),
      website_url: faker.internet.url()
    };
    const profileResponse = await stylistApi.setProfile(stylistProfile);
    expect(profileResponse.uuid).toBeDefined();

    // Create a new phone number for client
    clientPhoneNumber = await backdoorApi.getNewUnusedPhoneNumber();

    // Create invitation for the client
    const invitation: ClientInvitation = {
      phone: clientPhoneNumber
    };
    const inviteResponse = await stylistApi.createInvitations([invitation]);
    expect(inviteResponse.invitations.length).toEqual(1);
  });

  it('Can navigate to login screen', async () => {
    await clientApp.loadNew();
    await firstPage.getStarted();
    await waitFor(phoneLoginPage.phoneInput);
  });

  it('Can login with new phone number', async () => {
    // Enter phone number
    await phoneLoginPage.login(clientPhoneNumber);

    // and code input is visible
    await waitFor(phoneCodePage.codeInput);

    const loginCode = await backdoorApi.getCode(`+1${clientPhoneNumber}`);

    // Enter the correct code
    await phoneCodePage.codeInput.clear();
    await phoneCodePage.codeInput.sendKeys(loginCode);

    await waitForNot(phoneCodePage.codeInput);
  });

  it('Can see invitation', async () => {
    expect(await stylistInvitationPage.salonName.getText()).toEqual(stylistProfile.salon_name);
    expect((await stylistInvitationPage.address.getText()).trim()).toEqual(stylistProfile.salon_address);
    expect(await stylistInvitationPage.stylistName.getText()).toEqual(`${stylistProfile.first_name} ${stylistProfile.last_name}`);
    expect((await stylistInvitationPage.stylistPhone.getText()).trim()).toEqual(stylistProfile.phone);

    await stylistInvitationPage.getStarted();
  });

  it('Can navigate through info screens', async () => {
    await howMadeWorksPage.continue();
    await howPricingWorksPage.continue();
  });

  it('Can see profile page', async () => {
    await mainTabsPage.profileTab.click();
    await waitFor(profileSummaryPage.phone);
    expect((await profileSummaryPage.phone.getText()).trim()).toEqual(normalizePhoneNumber(clientPhoneNumber));
    expect((await profileSummaryPage.profileCompletion.getText()).trim()).toEqual('Profile completion 17%');
  });
});
