import { $ } from 'protractor';

import { waitForNot } from './utils';

/**
 * A page that is shown after login for inputting first and last name
 */
class NameSurnamePage {
  // UI element declarations.
  get firstNameInput() { return $('[data-test-id=first_name] input'); }
  get lastNameInput() { return $('[data-test-id=last_name] input'); }
  get submitBtn() { return $('[data-test-id=onContinue]'); }

  // Operations
  async fillIn(firstName, lastName) {
    await this.firstNameInput.sendKeys(firstName);
    await this.lastNameInput.sendKeys(lastName);
    await this.submitBtn.click();
    await waitForNot(this.submitBtn);
  }
}

export const nameSurnamePage = new NameSurnamePage();
