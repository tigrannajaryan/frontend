import { $ } from 'protractor';

import { click, waitForNot } from './utils';

class RegistrationDonePage {
  // UI element declarations.
  get continueBtn() { return $('registration-done button[data-test-id=continueBtn]'); }

  // Operations
  async continue() {
    await click(this.continueBtn);
    await waitForNot(this.continueBtn);
  }
}

export const registrationDonePage = new RegistrationDonePage();
