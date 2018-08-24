import { browser } from 'protractor';

import { getRandomString, waitFor } from './utils';
import { firstPage } from './first-page';
import { logregPage } from './logreg-page';
import { profilePage } from './profile-page';

describe('Registration Flow', () => {

  const email = `${getRandomString(15)}-test@madebeauty.com`;
  const password = getRandomString(10);

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
    expect(profilePage.firstNameInput.isPresent()).toBeTruthy();
    expect(profilePage.lastNameInput.isPresent()).toBeTruthy();

    // Fill registration form
    profilePage.fillForm('Tester', 'LastName');

    // TODO: continue registration flow test.
  });
});
