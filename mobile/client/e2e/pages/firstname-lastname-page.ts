import { $ } from 'protractor';

import { waitForNot } from '../shared-e2e/utils';

/**
 * A page that is shown after login for inputting first and last name
 */
class FirstNameLastNamePage {
  // UI element declarations.
  get firstNameInput() { return $('first-last-name [data-test-id=first_name] input'); }
  get lastNameInput() { return $('first-last-name [data-test-id=last_name] input'); }
  get submitBtn() { return $('first-last-name [data-test-id=onContinue]'); }

  // Operations
  async fillIn(firstName, lastName) {
    await this.firstNameInput.sendKeys(firstName);
    await this.lastNameInput.sendKeys(lastName);
    await this.submitBtn.click();
    await waitForNot(this.submitBtn);
  }
}

export const firstNameLastNamePage = new FirstNameLastNamePage();
