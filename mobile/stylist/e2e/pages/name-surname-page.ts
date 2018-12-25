import { $ } from 'protractor';

import { click, waitFor } from '../shared-e2e/utils';

class NameSurnamePage {
  // UI element declarations
  get firstName() { return $('field-edit [data-test-id=firstName] input'); }
  get lastName() { return $('field-edit [data-test-id=lastName] input'); }

  get continueButton() { return $('field-edit [data-test-id=continueBtn]'); }

  // Operations
  async fillForm(firstName, lastName) {
    await waitFor(this.firstName);
    await this.firstName.sendKeys(firstName);
    await this.lastName.sendKeys(lastName);
  }

  async submitForm() {
    await click(this.continueButton);
  }
}

export const nameSurnamePage = new NameSurnamePage();
