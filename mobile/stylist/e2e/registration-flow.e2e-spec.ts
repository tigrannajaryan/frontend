import { browser } from 'protractor';
import * as faker from 'faker';

import { clearIonicStorage, clearSessionData, click, getRandomString, globals, waitFor, waitForNot } from './shared-e2e/utils';
import { backdoorApi } from './shared-e2e/backdoor-api';
import { phoneLoginPage } from './shared-e2e/phone-login-page';
import { phoneCodePage } from './shared-e2e/phone-code-page';

import { profilePage } from './pages/profile-page';
import { welcomeToMadePage } from './pages/welcome-to-made-page';
import { firstPage } from './pages/first-page';
import { calendarExamplePage } from './pages/calendar-example-page';
import { pushPrimingPage } from './shared-e2e/push-priming-page';
import { registrationDonePage } from './shared-e2e/registration-done-page';
import { homePage } from './pages/home-page';

describe('Registration Flow', () => {

  let phoneNumber: string;
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const salonName = faker.company.companyName(0);
  const address = faker.address.streetAddress();
  const instagramName = getRandomString(8);
  const websiteName = getRandomString(8);

  beforeAll(async () => {
    await browser.restart();
    await clearIonicStorage();
    await browser.get('');
    await clearSessionData();

    phoneNumber = await backdoorApi.getNewUnusedPhoneNumber();
  });

  it('Can navigate to login screen', async () => {
    await firstPage.getStarted();
    await waitFor(phoneLoginPage.phoneInput);
  });

  it('Can login with new phone number', async () => {
    // Enter phone number
    await phoneLoginPage.login(phoneNumber);

    // and code input is visible
    await waitFor(phoneCodePage.codeInput);

    const loginCode = await backdoorApi.getCode(`+1${phoneNumber}`);

    // Enter the correct code
    await phoneCodePage.codeInput.clear();
    await phoneCodePage.codeInput.sendKeys(loginCode);

    await waitForNot(phoneCodePage.codeInput);
  });

  it('should be able to fill registration form', async () => {
    await waitForNot(globals.ionLoading);

    // We should arive to profile screen, check it.
    await waitFor(profilePage.continueButton);

    expect(profilePage.takePhotoBtn.isPresent()).toBeTruthy();
    expect(profilePage.firstNameInput.isPresent()).toBeTruthy();
    expect(profilePage.lastNameInput.isPresent()).toBeTruthy();
    expect(profilePage.salonNameInput.isPresent()).toBeTruthy();
    expect(profilePage.salonAddressInput.isPresent()).toBeTruthy();
    expect(profilePage.phoneNumberInput.isPresent()).toBeTruthy();
    expect(profilePage.instagramNameInput.isPresent()).toBeTruthy();
    expect(profilePage.websiteInput.isPresent()).toBeTruthy();
    expect(profilePage.continueButton.isPresent()).toBeTruthy();
    expect(profilePage.continueButton.isEnabled()).toBeFalsy();

    // Fill registration form
    await profilePage.fillForm(firstName, lastName, salonName, address, phoneNumber, instagramName, websiteName);

    await profilePage.submitForm();
  });

  it('can navigate through Welcome To Made page', async () => {
    await welcomeToMadePage.continue();
  });

  it('should show Calendar Example page', async () => {
    await calendarExamplePage.continue();
  });

  it('should show notification priming page', async () => {
    await pushPrimingPage.allow();
  });

  it('should show registration done screen', async () => {
    await registrationDonePage.continue();
  });

  it('should be able to open menu and logout', async () => {
    await waitFor(homePage.menuBtn);
    await click(homePage.menuBtn);
    await waitFor(homePage.logoutBtn);
    await click(homePage.logoutBtn);
  });

  it('should be able to login again', async () => {
    await waitFor(firstPage.getStartedBtn);
    await firstPage.getStarted();

    await waitFor(phoneLoginPage.phoneInput);
    await phoneLoginPage.login(phoneNumber);

    await waitFor(phoneCodePage.codeInput);

    const loginCode = await backdoorApi.getCode(`+1${phoneNumber}`);

    await phoneCodePage.codeInput.clear();
    await phoneCodePage.codeInput.sendKeys(loginCode);

    await waitForNot(phoneCodePage.codeInput);
  });

  it('should see home screen', async () => {
    waitFor(homePage.home);
  });
});
