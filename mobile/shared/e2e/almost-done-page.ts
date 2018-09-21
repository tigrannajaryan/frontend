import { $ } from 'protractor';

import { click, waitForNot } from './utils';

class AlmostDonePage {
  // UI element declarations.
  get continueBtn() { return $('page-almost-done button[data-test-id=continueBtn]'); }

  // Operations
  async continue() {
    await click(this.continueBtn);
    await waitForNot(this.continueBtn);
  }
}

export const almostDonePage = new AlmostDonePage();
