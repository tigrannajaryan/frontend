import * as faker from 'faker';

import { SetStylistServicesParams, StylistProfile } from './shared-app/api/stylist-app.models';
import { EmailAuthCredentials, UserRole } from './shared-app/api/auth.models';
import { stylistApi } from './shared-e2e/stylist-api';
import { backdoorApi } from './shared-e2e/backdoor-api';
import { ClientInvitation } from './shared-app/api/invitations.models';
import { click, getRandomEmail, getRandomString, normalizePhoneNumber, waitFor, waitForNot } from './shared-e2e/utils';
import { Worktime } from './shared-app/api/worktime.models';
import { phoneLoginPage } from './shared-e2e/phone-login-page';
import { phoneCodePage } from './shared-e2e/phone-code-page';
import { mainTabsPage } from './pages/main-tabs-page';
import { profileSummaryPage } from './pages/profile-summary-page';

export async function createTestStylist(serviceNames: string[], clientPhoneNumberToInvite: string): Promise<StylistProfile> {
  // Register new stylist
  const stylistCredentials: EmailAuthCredentials = {
    email: getRandomEmail(),
    password: getRandomString(Math.floor(Math.random() * 20) + 1),
    role: UserRole.stylist
  };
  const authResponse = await stylistApi.registerByEmail(stylistCredentials);
  expect(authResponse.token).toBeDefined();

  // Complete stylist profile
  const stylistProfile = {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    phone: normalizePhoneNumber(await backdoorApi.getNewUnusedPhoneNumber()),
    public_phone: normalizePhoneNumber(await backdoorApi.getNewUnusedPhoneNumber()),
    salon_name: faker.commerce.productName(),
    salon_address: faker.address.streetAddress(),
    instagram_url: faker.internet.url(),
    instagram_integrated: true,
    website_url: faker.internet.url(),
    profile_photo_url: faker.random.image(),
    followers_count: faker.random.number()
  };
  const profileResponse = await stylistApi.setProfile(stylistProfile);
  expect(profileResponse.uuid).toBeDefined();

  // Create invitation for the client
  const invitation: ClientInvitation = {
    phone: clientPhoneNumberToInvite
  };
  const inviteResponse = await stylistApi.createInvitations([invitation]);
  expect(inviteResponse.invitations.length).toEqual(1);

  // Create services
  const categorizeServices = await stylistApi.getStylistServices();
  const colorCategory = categorizeServices.categories.find(c => c.category_code === 'color');

  const services = [{
    name: serviceNames[0],
    description: '',
    base_price: 123,
    category_name: colorCategory.name,
    category_uuid: colorCategory.uuid,
    is_enabled: true,
    photo_samples: []
  },
  {
    name: serviceNames[1],
    description: '',
    base_price: 234,
    category_name: colorCategory.name,
    category_uuid: colorCategory.uuid,
    is_enabled: true,
    photo_samples: []
  }];

  const request: SetStylistServicesParams = {
    services,
    service_time_gap_minutes: 30
  };
  const savedServices = await stylistApi.setStylistServices(request);

  // Set working time
  const worktime: Worktime = {
    weekdays: []
  };
  for (let i = 1; i < 7; i++) {
    worktime.weekdays.push({
      label: '',
      weekday_iso: i,
      is_available: true,
      work_start_at: '00:09:00',
      work_end_at: '00:17:00'
    });
  }
  await stylistApi.setWorktime(worktime);

  return stylistProfile;
}

export async function performLogin(phoneNumber: string) {
    // Enter phone number
    await phoneLoginPage.login(phoneNumber);

    // and code input is visible
    await waitFor(phoneCodePage.codeInput);

    const loginCode = await backdoorApi.getCode(`+1${phoneNumber}`);

    // Enter the correct code
    await phoneCodePage.codeInput.clear();
    await phoneCodePage.codeInput.sendKeys(loginCode);

    await waitForNot(phoneCodePage.codeInput);
}

export async function performLogout() {
  await click(mainTabsPage.profileTab);
  await profileSummaryPage.logout();
  await waitForNot(mainTabsPage.profileTab);
  await waitFor(phoneLoginPage.phoneInput);
}
