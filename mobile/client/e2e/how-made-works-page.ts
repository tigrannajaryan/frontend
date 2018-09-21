import { $ } from 'protractor';

import { waitFor, waitForNot } from './shared-e2e/utils';

class HowMadeWorksPage {
  // UI element declarations.
  get continueBtn() { return $('page-how-made-works button[data-test-id=continueBtn]'); }

  // Operations
  async continue() {
    await waitFor(this.continueBtn);
    await this.continueBtn.click();
    await waitForNot(this.continueBtn);
  }
}

export const howMadeWorksPage = new HowMadeWorksPage();
