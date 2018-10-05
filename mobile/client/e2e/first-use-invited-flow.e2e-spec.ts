import * as faker from 'faker';

import { getRandomEmail, getRandomString, normalizePhoneNumber, waitFor, waitForNot } from './shared-e2e/utils';
import { backdoorApi } from './shared-e2e/backdoor-api';

import { phoneLoginPage } from './shared-e2e/phone-login-page';
import { phoneCodePage } from './shared-e2e/phone-code-page';
import { clientApp } from './client-app';
import { stylistApi } from './shared-e2e/stylist-api';
import { ClientInvitation } from './shared-app/stylist-api/invitations.models';
import { SetStylistServicesParams, StylistProfile } from './shared-app/stylist-api/stylist-models';
import { firstPage } from './pages/first-page';
import { AuthCredentials, UserRole } from './shared-app/stylist-api/auth-api-models';
import { stylistInvitationPage } from './pages/stylist-invitation-page';
import { howMadeWorksPage } from './pages/how-made-works-page';
import { howPricingWorksPage } from './pages/how-pricing-works-page';
import { mainTabsPage } from './pages/main-tabs-page';
import { profileSummaryPage } from './pages/profile-summary-page';
import { homePage } from './pages/home-page';
import { selectCategoryPage } from './pages/select-category-page';
import { selectServicePage } from './pages/select-service-page';
import { Worktime } from './shared-app/stylist-api/worktime.models';
import { selectDatePage } from './pages/select-date-page';

describe('First use flow for invited clients', () => {

  let clientPhoneNumber;
  let stylistProfile: StylistProfile;
  const serviceNames = ['Myservice1', 'Myservice2'];

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

  // it('Can remove service', async () => {
  //   await selectDatePage.deleteService(0);
  //   expect(selectDatePage.serviceItemName(0).getText()).toEqual(serviceNames[1]);
  // });
});
