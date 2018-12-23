import { $ } from 'protractor';

import { click, waitForNot } from '../shared-e2e/utils';

class NameSurnamePage {
  // UI element declarations
  get firstName() { return $('name-surname [data-test-id=firstName] input'); }
  get lastName() { return $('name-surname [data-test-id=lastName] input'); }

  get continueButton() { return $('[data-test-id=continueBtn]'); }

  // Operations
  async fillForm(firstName, lastName) {
    await this.firstName.sendKeys(firstName);
    await this.lastName.sendKeys(lastName);
  }

  async submitForm() {
    await click(nameSurnamePage.continueButton);
    await waitForNot(this.firstName);
  }
}

export const nameSurnamePage = new NameSurnamePage();
