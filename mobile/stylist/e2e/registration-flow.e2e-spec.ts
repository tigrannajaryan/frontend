import { browser } from 'protractor';
import * as faker from 'faker';

import {
  clearIonicStorage,
  clearSessionData,
  click,
  getRandomString,
  globals,
  waitFor,
  waitForNot
} from './shared-e2e/utils';
import { backdoorApi } from './shared-e2e/backdoor-api';
import { phoneLoginPage } from './shared-e2e/phone-login-page';
import { phoneCodePage } from './shared-e2e/phone-code-page';

import { registerProfilePage } from './pages/register-profile-page';
import { welcomeToMadePage } from './pages/welcome-to-made-page';
import { firstPage } from './pages/first-page';
import { calendarExamplePage } from './pages/calendar-example-page';
import { pushPrimingPage } from './shared-e2e/push-priming-page';
import { registrationDonePage } from './shared-e2e/registration-done-page';
import { instagramConnectPage } from './pages/instagram-connect-page';
import { homePage } from './pages/home-page';
import { profilePage } from './pages/profile-page';
import { worktimePage } from './pages/worktime-page';
import { discountsPage } from './pages/discounts-page';

describe('Registration Flow', () => {

  let phoneNumber: string;
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const salonName = faker.company.companyName(0);
  const address = faker.address.streetAddress();
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
    await waitFor(registerProfilePage.continueButton);

    expect(registerProfilePage.takePhotoBtn.isPresent()).toBeTruthy();
    expect(registerProfilePage.firstNameInput.isPresent()).toBeTruthy();
    expect(registerProfilePage.lastNameInput.isPresent()).toBeTruthy();
    expect(registerProfilePage.salonNameInput.isPresent()).toBeTruthy();
    expect(registerProfilePage.salonAddressInput.isPresent()).toBeTruthy();
    expect(registerProfilePage.phoneNumberInput.isPresent()).toBeTruthy();
    expect(registerProfilePage.websiteInput.isPresent()).toBeTruthy();
    expect(registerProfilePage.continueButton.isPresent()).toBeTruthy();
    expect(registerProfilePage.continueButton.isEnabled()).toBeFalsy();

    // Fill registration form
    await registerProfilePage.fillForm(firstName, lastName, salonName, address, phoneNumber, websiteName);

    await registerProfilePage.submitForm();
  });

  it('should skip Instagram connect page', async () => {
    await instagramConnectPage.skip();
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

  it('should change tab on profile screen to Edit tab', async () => {
    await waitFor(profilePage.getProfileEditTab);
    await click(profilePage.getProfileEditTab);
  });

  it('should go to Hours edit screen from profile edit tab', async () => {
    await profilePage.goToHoursPage();
    await click(worktimePage.goBack);
    await waitForNot(worktimePage.goBack);
  });

  it('should go to Services edit screen from profile edit tab with new profile', async () => {
    await profilePage.goToServicePage();
    await waitFor(homePage.menuBtn);
    await click(homePage.menuBtn);
    await browser.takeScreenshot(); // When calling browser.takeScreenshot() it’s somehow fixed. Don’t remove the screenshots taking from the code!
    await waitFor(homePage.getMenuProfileLink);
    await click(homePage.getMenuProfileLink);
    await browser.takeScreenshot(); // When calling browser.takeScreenshot() it’s somehow fixed. Don’t remove the screenshots taking from the code!
    await waitForNot(homePage.getMenuProfileLink);
    await waitFor(profilePage.getProfileEditTab);
  });

  it('should go to Discounts edit screen from profile edit tab', async () => {
    await waitFor(profilePage.getProfileEditTab);
    await click(profilePage.getProfileEditTab);
    await profilePage.goToDiscountsPage();
    await waitFor(discountsPage.goBack);
    await click(discountsPage.goBack);
    await waitForNot(discountsPage.goBack);
  });

  /**
   * Inside there is some very strange bug that is discussed
   * on https://stackoverflow.com/questions/11908249/debugging-element-is-not-clickable-at-point-error page.
   * When calling browser.takeScreenshot() it’s somehow fixed. Don’t remove the screenshots taking from the code!
   */
  it('should be able to open menu and logout', async () => {
    await waitFor(homePage.menuBtn);
    await browser.takeScreenshot();
    await click(homePage.menuBtn);
    await waitFor(homePage.logoutBtn);
    await browser.takeScreenshot();
    await click(homePage.logoutBtn);
    await browser.takeScreenshot();
    await waitForNot(homePage.logoutBtn);
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
