import { browser } from 'protractor';

import { getRandomNumber, getRandomString, waitFor } from './shared/utils';
import { firstPage } from './first-page';
import { logregPage } from './logreg-page';
import { profilePage } from './profile-page';

describe('Registration Flow', () => {

  const email = `${getRandomString(15)}-test@madebeauty.com`;
  const password = getRandomString(10);
  const firstName = getRandomString(6);
  const lastName = getRandomString(8);
  const salonName = getRandomString(8);
  const address = getRandomString(8);
  const phoneNumber = getRandomNumber(10);
  const instagramName = getRandomString(8);
  const websiteName = getRandomString(8);

  it('should be able to start registration', async () => {
    browser.get('');
    await waitFor(firstPage.registerLink);

    // Client the register link
    await firstPage.navigateToRegister();

    // Register using email and password
    await logregPage.register(email, password);
  });

  it('should be able to fill registration form', async () => {
    // We should arive to profile screen, check it.
    expect(profilePage.takePhotoBtn.isPresent()).toBeTruthy();
    expect(profilePage.firstNameInput.isPresent()).toBeTruthy();
    expect(profilePage.lastNameInput.isPresent()).toBeTruthy();
    expect(profilePage.salonNameInput.isPresent()).toBeTruthy();
    expect(profilePage.salonAddressInput.isPresent()).toBeTruthy();
    expect(profilePage.phoneNumberInput.isPresent()).toBeTruthy();
    expect(profilePage.instagramNameInput.isPresent()).toBeTruthy();
    expect(profilePage.websiteInput.isPresent()).toBeTruthy();
    expect(profilePage.continueButton.isPresent()).toBeTruthy();

    // Fill registration form
    profilePage.fillForm(firstName, lastName, salonName, address, phoneNumber, instagramName, websiteName);

    // TODO: continue registration flow test.
  });
});
